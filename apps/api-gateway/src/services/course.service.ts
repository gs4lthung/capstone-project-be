import { Course } from '@app/database/entities/course.entity';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
import { WalletService } from './wallet.service';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import {
  CreateCourseRequestDto,
  UpdateCourseDto,
} from '@app/shared/dtos/course/course.dto';
import { Province } from '@app/database/entities/province.entity';
import { District } from '@app/database/entities/district.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { VideoConference } from '@app/database/entities/video-conference.entity';
import { NotificationService } from './notification.service';
import { NotificationType } from '@app/shared/enums/notification.enum';

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
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(VideoConference)
    private readonly videoConferenceRepository: Repository<VideoConference>,
    private readonly sessionService: SessionService,
    private readonly notificationService: NotificationService,
    private readonly walletService: WalletService,
    private readonly datasource: DataSource,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
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
    return await this.datasource.transaction(async (manager) => {
      const subject = await this.subjectRepository.findOne({
        where: { id: subjectId, status: SubjectStatus.PUBLISHED },
        relations: ['lessons'],
        withDeleted: false,
      });
      if (!subject) throw new BadRequestException('Không tìm thấy chủ đề');
      if (
        (subject.lessons && subject.lessons.length === 0) ||
        !subject.lessons
      ) {
        throw new BadRequestException('Tài liệu khóa học chưa đầy đủ');
      }

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

      const savedCourse = await manager.getRepository(Course).save(newCourse);

      const courseMetadata = { ...savedCourse };
      courseMetadata.province = await this.provinceRepository.findOne({
        where: { id: data.province },
      });
      courseMetadata.district = await this.districtRepository.findOne({
        where: { id: data.district },
      });

      const newCourseCreationRequest = this.requestRepository.create({
        description: `Tạo khóa học: ${subject.name} - Khóa ${
          subject.courses ? subject.courses.length + 1 : 1
        }`,
        type: RequestType.COURSE_APPROVAL,
        metadata: {
          type: 'course',
          id: savedCourse.id,
          details: courseMetadata,
        } as RequestMetadata,
        createdBy: this.request.user as User,
        status: RequestStatus.PENDING,
      } as Request);

      await manager.getRepository(Request).save(newCourseCreationRequest);

      await this.notificationService.sendNotificationToAdmins({
        title: 'Yêu cầu tạo khóa học mới',
        body: `Một HLV đã gửi yêu cầu tạo khóa học mới.`,
        navigateTo: `/admin/requests/${newCourseCreationRequest.id}`,
        type: NotificationType.INFO,
      });

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'COURSE.CREATE_SUCCESS',
      );
    });
  }

  async update(
    id: number,
    data: UpdateCourseDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const course = await this.courseRepository.findOne({
        where: { id: id },
        relations: ['createdBy'],
        withDeleted: false,
      });
      if (!course) throw new BadRequestException('Không tìm thấy khóa học');
      if (course.createdBy.id !== this.request.user.id)
        throw new ForbiddenException('Không có quyền truy cập khóa học này');
      if (course.status !== CourseStatus.REJECTED)
        throw new BadRequestException(
          'Khoá học đã được duyệt, không thể cập nhật',
        );

      await manager.getRepository(Course).update(course.id, {
        ...data,
        province: data.province
          ? ({ id: data.province } as Province)
          : course.province,
        district: data.district
          ? ({ id: data.district } as District)
          : course.district,
      });

      await this.notificationService.sendNotificationToAdmins({
        title: ' Cập nhật yêu cầu tạo khóa học',
        body: `Một HLV đã cập nhật yêu cầu tạo khóa học.`,
        navigateTo: `/admin/requests/${course.id}`,
        type: NotificationType.INFO,
      });

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'COURSE.UPDATE_SUCCESS',
      );
    });
  }

  async approveCourseCreationRequest(
    id: number,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const request = await this.requestRepository.findOne({
        where: { id: id },
        relations: ['createdBy', 'actions'],
      });
      if (!request) throw new BadRequestException('Không tìm thấy yêu cầu');
      if (request.status === RequestStatus.APPROVED)
        throw new BadRequestException('Yêu cầu không được chờ duyệt');

      const course = await this.courseRepository.findOne({
        where: { id: request.metadata.id },
        withDeleted: false,
        relations: ['subject', 'subject.lessons'],
      });
      if (!course) throw new BadRequestException('Không tìm thấy khóa học');
      if (course.totalSessions <= 0)
        throw new BadRequestException('Khóa học chưa có buổi học nào');

      if (
        request.metadata.details.schedules &&
        request.metadata.details.schedules.length > 0
      ) {
        course.endDate = this.calculateCourseEndDate(
          course.startDate,
          course.totalSessions,
          request.metadata.details.schedules,
        );

        const sessions =
          await this.sessionService.generateSessionsFromSchedules(
            course,
            request.metadata.details.schedules,
          );
        for (const lesson of course.subject.lessons) {
          const session = sessions.find((ses) => ses.lesson.id === lesson.id);
          if (session) {
            session.videos = [];
            session.quizzes = [];
            for (const video of lesson.videos) {
              delete video.id;
              session.videos.push({
                ...video,
                lesson: null,
                session: session,
              });
            }
            for (const quiz of lesson.quizzes) {
              delete quiz.id;
              for (const question of quiz.questions) {
                delete question.id;
                for (const option of question.options) {
                  delete option.id;
                }
              }
              session.quizzes.push({
                ...quiz,
                lesson: null,
                session: session,
              });
            }
          }
        }

        await manager.getRepository(Session).save(sessions);
      }

      const videoConference = this.videoConferenceRepository.create({
        course: course,
        channelName: `course-${course.id}-vc`,
      });
      await manager.getRepository(VideoConference).save(videoConference);

      course.status = CourseStatus.APPROVED;
      course.videoConference = videoConference;
      await manager.getRepository(Course).save(course);

      request.status = RequestStatus.APPROVED;
      await manager.getRepository(Request).save(request);

      const newRequestAction = this.requestActionRepository.create({
        type: RequestActionType.APPROVED,
        comment: 'Yêu cầu đã được duyệt',
        request: request,
        handledBy: this.request.user as User,
      });
      await manager.getRepository(RequestAction).save(newRequestAction);

      await this.notificationService.sendNotification({
        userId: request.createdBy.id,
        title: 'Yêu cầu tạo khóa học được duyệt',
        body: `Yêu cầu tạo khóa học của bạn đã được duyệt.`,
        navigateTo: `/coach/courses/${course.id}`,
        type: NotificationType.SUCCESS,
      });

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'COURSE.CREATE_SUCCESS',
      );
    });
  }

  async rejectCourseCreationRequest(
    id: number,
    reason: string,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const request = await this.requestRepository.findOne({
        where: { id: id },
        relations: ['createdBy', 'actions'],
      });
      if (!request) throw new BadRequestException('Không tìm thấy yêu cầu');
      if (
        request.status === RequestStatus.REJECTED ||
        request.status === RequestStatus.APPROVED
      )
        throw new BadRequestException('Yêu cầu không được chờ duyệt');

      const course = await this.courseRepository.findOne({
        where: { id: request.metadata.id },
        withDeleted: false,
      });
      if (!course) throw new BadRequestException('Không tìm thấy khóa học');

      course.status = CourseStatus.REJECTED;
      await manager.getRepository(Course).save(course);

      request.status = RequestStatus.REJECTED;
      await manager.getRepository(Request).save(request);

      const newRequestAction = this.requestActionRepository.create({
        type: RequestActionType.REJECTED,
        comment: reason,
        request: request,
        handledBy: this.request.user as User,
      });
      await manager.getRepository(RequestAction).save(newRequestAction);

      await this.notificationService.sendNotification({
        userId: request.createdBy.id,
        title: 'Yêu cầu tạo khóa học bị từ chối',
        body: `Yêu cầu tạo khóa học của bạn đã bị từ chối.`,
        navigateTo: `/coach/courses/${course.id}`,
        type: NotificationType.ERROR,
      });

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'COURSE.REJECT_SUCCESS',
      );
    });
  }

  async coachCancelCourse(id: number): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const course = await this.courseRepository.findOne({
        where: { id: id },
        relations: ['createdBy', 'enrollments'],
        withDeleted: false,
      });
      if (!course) throw new BadRequestException('Không tìm thấy khóa học');

      const isHasEnrollment =
        course.enrollments && course.enrollments.length > 0;
      if (isHasEnrollment) {
        throw new BadRequestException(
          'Khóa học đã có học viên đăng ký, không thể hủy',
        );
      }

      course.status = CourseStatus.CANCELLED;
      await manager.getRepository(Course).save(course);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'COURSE.CANCEL_SUCCESS',
      );
    });
  }

  async learnerCancelCourse(id: number): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const course = await this.courseRepository.findOne({
        where: { id: id },
        relations: ['createdBy', 'enrollments'],
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

      const enrollmentsToUpdate = course.enrollments.filter(
        (e) => e.status === EnrollmentStatus.PENDING_GROUP,
      );
      enrollmentsToUpdate.forEach(
        (e) => (e.status = EnrollmentStatus.CONFIRMED),
      );
      await manager.getRepository(Enrollment).save(enrollmentsToUpdate);

      if (
        course.currentParticipants >= course.minParticipants &&
        course.currentParticipants < course.maxParticipants
      ) {
        course.status = CourseStatus.READY_OPENED;
      } else if (course.currentParticipants >= course.maxParticipants) {
        course.status = CourseStatus.FULL;
      }
      await manager.getRepository(Course).save(course);

      await this.notificationService.sendNotification({
        userId: course.createdBy.id,
        title: 'Học viên hủy đăng ký khóa học',
        body: `Một học viên đã hủy đăng ký khóa học của bạn.`,
        navigateTo: `/coach/courses/${course.id}`,
        type: NotificationType.WARNING,
      });

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'COURSE.CANCEL_SUCCESS',
      );
    });
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
      throw new BadRequestException('Bạn phải có ít nhất 1 buổi học');
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
