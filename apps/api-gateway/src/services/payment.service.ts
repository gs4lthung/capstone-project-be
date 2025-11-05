import { Course } from '@app/database/entities/course.entity';
import { Enrollment } from '@app/database/entities/enrollment.entity';
import {
  Payment,
  PaginatedPayment,
} from '@app/database/entities/payment.entity';
import { User } from '@app/database/entities/user.entity';
import { PayosService } from '@app/payos';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  CheckoutResponseDataType,
  CreatePayoutRequestDto,
} from '@app/shared/dtos/payments/payment.dto';
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
import { DataSource, Repository } from 'typeorm';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';

@Injectable({ scope: Scope.REQUEST })
export class PaymentService extends BaseTypeOrmService<Payment> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly payosService: PayosService,
    private readonly datasource: DataSource,
  ) {
    super(paymentRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginatedPayment> {
    return super.find(findOptions, 'payment', PaginatedPayment);
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: id },
      withDeleted: false,
      relations: ['enrollment', 'enrollment.course', 'enrollment.user'],
    });

    if (!payment) throw new Error('Payment not found');

    return payment;
  }

  async createCoursePaymentLink(
    id: number,
  ): Promise<CustomApiResponse<Payment>> {
    return await this.datasource.transaction(async (manager) => {
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
        if (
          enrollment.status !== EnrollmentStatus.CANCELLED &&
          enrollment.status !== EnrollmentStatus.UNPAID
        ) {
          throw new BadRequestException('Bạn đã đăng ký khóa học này rồi');
        }
        enrollment.status = EnrollmentStatus.UNPAID;
        await manager.getRepository(Enrollment).save(enrollment);
      } else {
        newEnrollment = this.enrollmentRepository.create({
          user: { id: this.request.user.id } as User,
          course: course as Course,
          status: EnrollmentStatus.UNPAID,
        });
        await manager.getRepository(Enrollment).save(newEnrollment);
      }

      const payosResponse = await this.payosService.createPaymentLink({
        orderCode: CryptoUtils.generateRandomNumber(10000, 99999),
        amount: parseInt((course.pricePerParticipant / 1000).toString()), /////////
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
      await manager.getRepository(Payment).save(payment);

      delete payment.enrollment;

      return new CustomApiResponse<Payment>(
        HttpStatus.CREATED,
        'PAYMENT.CREATE_SUCCESS',
        payment,
      );
    });
  }

  async handlePaymentSuccess(data: CheckoutResponseDataType): Promise<void> {
    return await this.datasource.transaction(async (manager) => {
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

      const hasSuccessfulPayment = await this.paymentRepository.findOne({
        where: {
          enrollment: { id: payment.enrollment.id },
          status: PaymentStatus.PAID,
        },
      });
      if (hasSuccessfulPayment) {
        return;
      }

      const course = await this.courseRepository.findOne({
        where: { id: payment.enrollment.course.id },
        relations: ['enrollments'],
      });

      course.enrollments.map((enr) => {
        if (enr.id === payment.enrollment.id) {
          enr.paymentAmount = payment.amount * 1000; /////////
        }
        return enr;
      });

      course.currentParticipants += 1;
      course.totalEarnings =
        Number(course.totalEarnings) + Number(payment.amount) * 1000;

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
      await manager.getRepository(Payment).save(payment);

      await manager.getRepository(Course).save(course);
    });
  }

  async handlePaymentCancel(data: CheckoutResponseDataType): Promise<void> {
    return await this.datasource.transaction(async (manager) => {
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
      await manager.getRepository(Payment).save(payment);
    });
  }

  async createPayoutRequest(data: CreatePayoutRequestDto) {
    return this.payosService.payoutToBank(data);
  }
}
