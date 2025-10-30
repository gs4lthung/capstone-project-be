import { Course } from '@app/database/entities/course.entity';
import { Enrollment } from '@app/database/entities/enrollment.entity';
import { Payment } from '@app/database/entities/payment.entity';
import { User } from '@app/database/entities/user.entity';
import { PayosService } from '@app/payos';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CheckoutResponseDataType } from '@app/shared/dtos/payments/payment.dto';
import {
  CourseLearningFormat,
  CourseStatus,
} from '@app/shared/enums/course.enum';
import { EnrollmentStatus } from '@app/shared/enums/enrollment.enum';
import { PaymentStatus } from '@app/shared/enums/payment.enum';
import { CryptoUtils } from '@app/shared/utils/crypto.util';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class PaymentService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly payosService: PayosService,
  ) {}

  async createCoursePaymentLink(
    id: number,
  ): Promise<CustomApiResponse<Payment>> {
    const course = await this.courseRepository.findOne({
      where: { id: id },
      withDeleted: false,
      relations: ['enrollments', 'createdBy'],
    });
    if (!course) throw new BadRequestException('Không tìm thấy khóa học');
    if (
      course.status !== CourseStatus.APPROVED &&
      course.status !== CourseStatus.READY_OPENED
    )
      throw new BadRequestException('Khóa học chưa sẵn sàng để đăng ký');

    const hasLearnerEnrolled = course.enrollments.find(
      (enrollment) => enrollment.user.id === this.request.user.id,
    );

    let enrollment: Enrollment, newEnrollment: Enrollment;
    if (hasLearnerEnrolled) {
      enrollment = await this.enrollmentRepository.findOne({
        where: {
          user: { id: this.request.user.id } as User,
          course: { id: course.id } as Course,
        },
        withDeleted: false,
      });
      if (enrollment.status !== EnrollmentStatus.CANCELLED) {
        throw new BadRequestException('Bạn đã đăng ký khóa học này rồi');
      }
      enrollment.status = EnrollmentStatus.UNPAID;
      await this.enrollmentRepository.save(enrollment);
    } else {
      newEnrollment = this.enrollmentRepository.create({
        user: { id: this.request.user.id } as User,
        course: course as Course,
        status: EnrollmentStatus.UNPAID,
      });
      await this.enrollmentRepository.save(newEnrollment);
    }

    const payosResponse = await this.payosService.createPaymentLink({
      orderCode: CryptoUtils.generateRandomNumber(10000, 99999),
      amount: parseInt((course.pricePerParticipant / 1000).toString()),
      description: 'Thanh toán khóa học',
      expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });
    const payment = this.paymentRepository.create({
      amount: payosResponse.amount,
      description: payosResponse.description,
      orderCode: payosResponse.orderCode,
      paymentLinkId: payosResponse.paymentLinkId,
      checkoutUrl: payosResponse.checkoutUrl,
      qrCode: payosResponse.qrCode,
      status: PaymentStatus.PENDING,
      enrollment: enrollment ? enrollment : newEnrollment,
    });
    await this.paymentRepository.save(payment);

    delete payment.enrollment;

    return new CustomApiResponse<Payment>(
      HttpStatus.CREATED,
      'PAYMENT.CREATE_SUCCESS',
      payment,
    );
  }

  async handlePaymentSuccess(data: CheckoutResponseDataType): Promise<void> {
    if (data.status !== 'PAID') {
      return;
    }

    const payment = await this.paymentRepository.findOne({
      where: { orderCode: data.orderCode },
      relations: ['enrollment'],
    });
    if (!payment) {
      return;
    }

    const course = await this.courseRepository.findOne({
      where: { id: payment.enrollment.course.id },
      relations: ['enrollments'],
    });

    course.enrollments.map((enr) => {
      if (enr.id === payment.enrollment.id) {
        enr.paymentAmount = payment.amount * 1000;
      }
      return enr;
    });

    course.currentParticipants += 1;

    switch (course.learningFormat) {
      case CourseLearningFormat.INDIVIDUAL:
        course.status = CourseStatus.FULL;
        course.enrollments.map((enr) => {
          if (enr.id === payment.enrollment.id) {
            enr.status = EnrollmentStatus.CONFIRMED;
          }
        });
        break;
      case CourseLearningFormat.GROUP:
        course.enrollments = course.enrollments.map((enr) => {
          if (enr.id === payment.enrollment.id) {
            enr.status = EnrollmentStatus.PENDING_GROUP;
          }
          return enr;
        });
        if (
          course.currentParticipants >= course.minParticipants &&
          course.currentParticipants < course.maxParticipants
        ) {
          for (const enr of course.enrollments) {
            if (enr.status === EnrollmentStatus.PENDING_GROUP)
              enr.status = EnrollmentStatus.CONFIRMED;
          }
          course.status = CourseStatus.READY_OPENED;
        } else if (course.currentParticipants >= course.maxParticipants) {
          for (const enr of course.enrollments) {
            if (enr.status === EnrollmentStatus.PENDING_GROUP)
              enr.status = EnrollmentStatus.CONFIRMED;
          }
          course.status = CourseStatus.FULL;
        }
        break;
    }

    payment.status = PaymentStatus.PAID;
    await this.paymentRepository.save(payment);

    await this.courseRepository.save(course);
  }

  async handlePaymentCancel(data: CheckoutResponseDataType): Promise<void> {
    if (data.status !== 'CANCELLED') {
      return;
    }

    const payment = await this.paymentRepository.findOne({
      where: { orderCode: data.orderCode },
      relations: ['enrollment'],
    });
    if (!payment) {
      return;
    }
    payment.status = PaymentStatus.CANCELLED;
    await this.paymentRepository.save(payment);
  }
}
