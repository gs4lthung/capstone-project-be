import { Course } from '@app/database/entities/course.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CreateCourseRequestDto } from '@app/shared/dtos/course/course.dto';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
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
import { CourseStatus } from '@app/shared/enums/course.enum';
import { Enrollment } from '@app/database/entities/enrollment.entity';
import { EnrollmentStatus } from '@app/shared/enums/enrollment.enum';
import { Schedule } from '@app/database/entities/schedule.entity';
import { Subject } from '@app/database/entities/subject.entity';
import { SubjectStatus } from '@app/shared/enums/subject.enum';
import { Wallet } from '@app/database/entities/wallet.entity';
import { WalletService } from './wallet.service';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';

@Injectable({ scope: Scope.REQUEST })
export class CourseService extends BaseTypeOrmService<Course> {
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
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly sessionService: SessionService,
    private readonly walletService: WalletService,
  ) {
    super(courseRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginateObject<Course>> {
    const courses = await super.find(
      findOptions,
      'course',
      PaginateObject<Course>,
    );
    return courses;
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: id },
      withDeleted: false,
      relations: ['subject', 'sessions', 'enrollments'],
    });

    if (!course) throw new Error('Course not found');

    return course;
  }

  async createCourseCreationRequest(
    subjectId: number,
    data: CreateCourseRequestDto,
  ): Promise<CustomApiResponse<void>> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId, status: SubjectStatus.PUBLISHED },
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
      totalSessions: subject.lessons ? subject.lessons.length : 0,
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
      where: { id: request.metadata.id },
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

  async learnerCancelCourse(id: number): Promise<CustomApiResponse<void>> {
    const course = await this.courseRepository.findOne({
      where: { id: id },
      withDeleted: false,
    });
    if (!course) throw new BadRequestException('Không tìm thấy khóa học');
    if (
      course.status !== CourseStatus.APPROVED &&
      course.status !== CourseStatus.READY_OPENED &&
      course.status !== CourseStatus.FULL
    ) {
      throw new BadRequestException('Khóa học không thể hủy');
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        course: { id: course.id },
        user: { id: this.request.user.id as User['id'] },
      },
      withDeleted: false,
    });
    if (!enrollment) throw new BadRequestException('Không tìm thấy đăng ký');
    if (
      enrollment.status !== EnrollmentStatus.UNPAID &&
      enrollment.status !== EnrollmentStatus.PENDING_GROUP &&
      enrollment.status !== EnrollmentStatus.CONFIRMED
    ) {
      throw new BadRequestException('Trạng thái đăng ký không hợp lệ');
    }

    if (
      enrollment.status === EnrollmentStatus.PENDING_GROUP ||
      enrollment.status === EnrollmentStatus.CONFIRMED
    ) {
      await this.walletService.handleWalletTopUp(
        this.request.user.id as User['id'],
        enrollment.paymentAmount,
      );
    }
    enrollment.status = EnrollmentStatus.CANCELLED;
    await this.enrollmentRepository.save(enrollment);

    course.currentParticipants -= 1;
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
    await this.courseRepository.save(course);

    return new CustomApiResponse<void>(HttpStatus.OK, 'COURSE.CANCEL_SUCCESS');
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
