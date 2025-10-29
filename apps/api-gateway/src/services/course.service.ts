import { ConfigService } from '@app/config';
import { Course } from '@app/database/entities/course.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import {
  CreateCourseRequestDto,
  PaginatedCourse,
} from '@app/shared/dtos/course/course.dto';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import {
  BadRequestException,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionService } from './session.service';
import { Session } from '@app/database/entities/session.entity';
import { RequestAction } from '@app/database/entities/request-action.entity';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  RequestActionType,
  RequestStatus,
  RequestType,
} from '@app/shared/enums/request.enum';
import { User } from '@app/database/entities/user.entity';
import {
  Request,
  RequestMetadata,
} from '@app/database/entities/request.entity';
import {
  CourseLearningFormat,
  CourseStatus,
} from '@app/shared/enums/course.enum';
import { Enrollment } from '@app/database/entities/enrollment.entity';
import { EnrollmentStatus } from '@app/shared/enums/enrollment.enum';
import { PayosService } from '@app/payos';
import { CryptoUtils } from '@app/shared/utils/crypto.util';
import { Payment } from '@app/database/entities/payment.entity';
import { PaymentStatus } from '@app/shared/enums/payment.enum';
import { Schedule } from '@app/database/entities/schedule.entity';
import { Subject } from '@app/database/entities/subject.entity';

@Injectable({ scope: Scope.REQUEST })
export class CourseService extends BaseTypeOrmService<Course> {
  private readonly logger = new Logger(CourseService.name);

  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(RequestAction)
    private readonly requestActionRepository: Repository<RequestAction>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => SessionService))
    private readonly sessionService: SessionService,
    private readonly payosService: PayosService,
  ) {
    super(courseRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginatedCourse> {
    return super.find(findOptions, 'course', PaginatedCourse);
  }

  async createCourseCreationRequest(
    subjectId: number,
    data: CreateCourseRequestDto,
  ): Promise<CustomApiResponse<void>> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
      withDeleted: false,
    });
    if (!subject) throw new BadRequestException('Không tìm thấy chủ đề');

    const newCourse = this.courseRepository.create({
      ...data,
      name:
        subject.name +
        ` -  Khóa ${subject.courses ? subject.courses.length + 1 : 1}`,
      description: subject.description ? subject.description || '' : '',
      order: subject.courses ? subject.courses.length + 1 : 1,
      level: subject.level,
      subject: subject,
      createdBy: this.request.user as User,
    } as unknown as Course);

    const savedCourse = await this.courseRepository.save(newCourse);

    const newCourseCreationRequest = this.requestRepository.create({
      description: `Tạo khóa học: ${subject.name} - Khóa ${
        subject.courses ? subject.courses.length + 1 : 1
      }`,
      type: RequestType.COURSE_APPROVAL,
      metadata: {
        type: 'course',
        id: savedCourse.id,
        details: data,
      } as RequestMetadata,
      createdBy: this.request.user as User,
      status: RequestStatus.PENDING,
    } as Request);

    await this.requestRepository.save(newCourseCreationRequest);

    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'COURSE.CREATE_SUCCESS',
    );
  }

  async approveCourseCreationRequest(
    id: number,
  ): Promise<CustomApiResponse<void>> {
    const request = await this.requestRepository.findOne({
      where: { id: id },
      relations: ['createdBy', 'actions'],
    });
    if (!request) throw new BadRequestException('Không tìm thấy yêu cầu');
    if (request.status !== RequestStatus.PENDING)
      throw new BadRequestException('Yêu cầu không được chờ duyệt');

    const course = await this.courseRepository.findOne({
      where: { id: request.metadata.details.id },
      withDeleted: false,
    });
    if (!course) throw new BadRequestException('Không tìm thấy khóa học');

    if (
      request.metadata.details.schedules &&
      request.metadata.details.schedules.length > 0
    ) {
      course.endDate = this.calculateCourseEndDate(
        course.startDate,
        course.totalSessions,
        request.metadata.details.schedules,
      );

      const sessions = await this.sessionService.generateSessionsFromSchedules(
        course,
        request.metadata.details.schedules,
      );
      await this.sessionRepository.insert(sessions);
    }

    course.status = CourseStatus.APPROVED;
    await this.courseRepository.save(course);

    request.status = RequestStatus.APPROVED;
    await this.requestRepository.save(request);

    const newRequestAction = this.requestActionRepository.create({
      type: RequestActionType.APPROVED,
      comment: 'Yêu cầu đã được duyệt',
      request: request,
      handledBy: this.request.user as User,
    });
    await this.requestActionRepository.save(newRequestAction);

    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'COURSE.CREATE_SUCCESS',
    );
  }

  async enrollCourse(id: number): Promise<CustomApiResponse<void>> {
    const course = await this.courseRepository.findOne({
      where: { id: id },
      withDeleted: false,
      relations: ['enrollments', 'createdBy'],
    });
    if (!course) throw new BadRequestException('Không tìm thấy khóa học');

    switch (course.status) {
      case CourseStatus.CANCELLED:
        throw new BadRequestException('Khóa học đã bị hủy');
      case CourseStatus.COMPLETED:
        throw new BadRequestException('Khóa học đã hoàn thành');
      case CourseStatus.FULL:
        throw new BadRequestException('Khóa học đã đủ người');
      case CourseStatus.PENDING_APPROVAL:
        throw new BadRequestException('Khóa học chưa được duyệt');
      case CourseStatus.REJECTED:
        throw new BadRequestException('Khóa học không tìm thấy');
      case CourseStatus.ON_GOING:
        throw new BadRequestException('Khóa học đang diễn ra');
    }

    const enrollment = course.enrollments.find(
      (enrollment) => enrollment.user.id === this.request.user.id,
    );
    if (enrollment)
      throw new BadRequestException('Bạn đã đăng ký khóa học này');

    if (course.learningFormat === CourseLearningFormat.GROUP) {
      if (
        course.enrollments.length + 1 >= course.minParticipants &&
        course.enrollments.length + 1 < course.maxParticipants
      ) {
        course.status = CourseStatus.READY_OPENED;
      } else if (course.enrollments.length + 1 >= course.maxParticipants) {
        course.status = CourseStatus.FULL;
      }
    } else if (course.learningFormat === CourseLearningFormat.INDIVIDUAL) {
      course.status = CourseStatus.FULL;
    }

    await this.courseRepository.save(course);

    const newEnrollment = this.enrollmentRepository.create({
      user: { id: this.request.user.id } as User,
      course: course as Course,
      status:
        course.learningFormat === CourseLearningFormat.GROUP
          ? EnrollmentStatus.PENDING_GROUP
          : EnrollmentStatus.CONFIRMED,
    });
    await this.enrollmentRepository.save(newEnrollment);

    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'COURSE.ENROLL_SUCCESS',
    );
  }

  async createCoursePaymentLink(
    id: number,
  ): Promise<CustomApiResponse<Payment>> {
    const course = await this.courseRepository.findOne({
      where: { id: id },
      withDeleted: false,
      relations: ['enrollments', 'createdBy'],
    });
    if (!course) throw new BadRequestException('Không tìm thấy khóa học');

    const enrollment = course.enrollments.find(
      (enrollment) => enrollment.user.id === this.request.user.id,
    );
    if (!enrollment) throw new BadRequestException('Bạn chưa đăng ký khóa học');

    const payosResponse = await this.payosService.createPaymentLink({
      orderCode: CryptoUtils.generateRandomNumber(10000, 99999),
      amount: parseInt(course.pricePerParticipant.toString()),
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
      enrollment: enrollment,
    });
    await this.paymentRepository.save(payment);

    delete payment.enrollment;

    return new CustomApiResponse<Payment>(
      HttpStatus.CREATED,
      'PAYMENT.CREATE_SUCCESS',
      payment,
    );
  }

  calculateCourseEndDate(
    startDate: Date,
    totalSessions: number,
    schedules: Schedule[],
  ): Date {
    if (!schedules || schedules.length === 0) {
      throw new BadRequestException(
        'Schedules are required to calculate end date',
      );
    }

    if (totalSessions <= 0) {
      throw new BadRequestException('Total sessions must be greater than 0');
    }

    const dayMap: { [key: string]: number } = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const scheduleDays = schedules.map(
      (schedule) => dayMap[schedule.dayOfWeek],
    );
    const currentDate = new Date(startDate);
    let sessionsCount = 0;

    while (sessionsCount < totalSessions) {
      if (scheduleDays.includes(currentDate.getDay())) {
        sessionsCount++;
        if (sessionsCount === totalSessions) {
          break;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return new Date(currentDate);
  }
}
