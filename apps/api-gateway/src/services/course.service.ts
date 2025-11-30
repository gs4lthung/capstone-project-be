import { Course } from '@app/database/entities/course.entity';
import { BunnyService } from '@app/bunny';
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
import {
  CourseLearningFormat,
  CourseStatus,
} from '@app/shared/enums/course.enum';
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
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { NotificationService } from './notification.service';
import { NotificationType } from '@app/shared/enums/notification.enum';
import { ScheduleService } from './schedule.service';
import { ConfigurationService } from './configuration.service';
import { DateTimeUtils } from '@app/shared/utils/datetime.util';
import { Court } from '@app/database/entities/court.entity';
import { CoachVideoStatus } from '@app/shared/enums/coach.enum';
import { CryptoUtils } from '@app/shared/utils/crypto.util';
import { PickleballLevel } from '@app/shared/enums/pickleball.enum';

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
    private readonly sessionService: SessionService,
    private readonly notificationService: NotificationService,
    private readonly walletService: WalletService,
    private readonly datasource: DataSource,
    private readonly configurationService: ConfigurationService,
    private readonly scheduleService: ScheduleService,
    private readonly bunnyService: BunnyService,
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
    return await this.datasource.transaction(async (manager) => {
      const queryBuilder = manager
        .getRepository(Course)
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.sessions', 'sessions')
        .leftJoinAndSelect('course.createdBy', 'createdBy')
        .leftJoinAndSelect('sessions.quiz', 'quiz')
        .leftJoinAndSelect('sessions.video', 'video')
        .leftJoinAndSelect('course.enrollments', 'enrollments')
        .leftJoinAndSelect('enrollments.user', 'user')
        .leftJoinAndSelect('course.subject', 'subject')
        .leftJoinAndSelect('course.schedules', 'schedules')
        .leftJoinAndSelect('course.court', 'court')
        .leftJoinAndSelect('court.province', 'province')
        .leftJoinAndSelect('court.district', 'district')
        .where('course.id = :id', {
          id: id,
        })
        .select([
          'course.id',
          'course.name',
          'course.description',
          'course.status',
          'course.cancellingReason',
          'course.progressPct',
          'course.startDate',
          'course.endDate',
          'course.level',
          'course.learningFormat',
          'course.totalSessions',
          'course.publicUrl',
          'course.pricePerParticipant',
          'course.currentParticipants',
          'course.minParticipants',
          'course.maxParticipants',
          'course.totalEarnings',
          'course.createdAt',
          'course.updatedAt',
          'sessions.id',
          'sessions.name',
          'sessions.description',
          'sessions.sessionNumber',
          'sessions.scheduleDate',
          'sessions.startTime',
          'sessions.endTime',
          'sessions.durationInMinutes',
          'sessions.status',
          'sessions.completedAt',
          'quiz.id',
          'video.id',
          'subject.id',
          'subject.name',
          'schedules.id',
          'schedules.dayOfWeek',
          'schedules.startTime',
          'schedules.endTime',
          'schedules.totalSessions',
          'court.id',
          'court.name',
          'court.phoneNumber',
          'court.pricePerHour',
          'court.publicUrl',
          'court.address',
          'province.id',
          'province.name',
          'district.id',
          'district.name',
          'enrollments.id',
          'enrollments.paymentAmount',
          'enrollments.status',
          'enrollments.enrolledAt',
          'user.id',
          'user.fullName',
          'createdBy.id',
          'createdBy.fullName',
          'createdBy.phoneNumber',
        ]);

      const course = await queryBuilder.getOne();
      if (!course) throw new BadRequestException('Course not found');

      return course;
    });
  }

  async findAvailableCourses(
    page: number = 1,
    size: number = 10,
    name?: string,
    level?: PickleballLevel,
    province?: number,
    district?: number,
  ): Promise<PaginateObject<Course>> {
    return await this.datasource.transaction(async (manager) => {
      const offset = (page - 1) * size;

      const queryBuilder = manager
        .getRepository(Course)
        .createQueryBuilder('course');

      queryBuilder
        .leftJoinAndSelect('course.sessions', 'sessions')
        .leftJoinAndSelect('course.court', 'court')
        .leftJoinAndSelect('court.province', 'province')
        .leftJoinAndSelect('course.schedules', 'schedules')
        .leftJoinAndSelect('court.district', 'district')
        .leftJoinAndSelect('course.enrollments', 'enrollments')
        .leftJoinAndSelect('course.createdBy', 'createdBy')
        .leftJoinAndSelect('enrollments.user', 'user');

      queryBuilder.where('course.status IN (:...statuses)', {
        statuses: [
          CourseStatus.APPROVED,
          CourseStatus.READY_OPENED,
          CourseStatus.FULL,
        ],
      });

      if (name) {
        queryBuilder.andWhere('course.name LIKE :name', { name: `%${name}%` });
      }

      if (level) {
        queryBuilder.andWhere('course.level = :level', { level });
      }

      if (province) {
        queryBuilder.andWhere('province.id = :provinceId', {
          provinceId: province,
        });
      }

      if (district) {
        queryBuilder.andWhere('district.id = :districtId', {
          districtId: district,
        });
      }

      queryBuilder.skip(offset).take(size);

      queryBuilder.orderBy('course.createdAt', 'DESC');

      queryBuilder.select([
        'course.id',
        'course.name',
        'course.description',
        'course.status',
        'course.cancellingReason',
        'course.progressPct',
        'course.startDate',
        'course.endDate',
        'course.level',
        'course.learningFormat',
        'course.publicUrl',
        'course.pricePerParticipant',
        'course.currentParticipants',
        'course.minParticipants',
        'course.maxParticipants',
        'course.totalSessions',
        'course.totalEarnings',
        'course.createdAt',
        'course.updatedAt',
        'schedules.id',
        'schedules.dayOfWeek',
        'schedules.startTime',
        'schedules.endTime',
        'court.id',
        'court.name',
        'court.phoneNumber',
        'court.pricePerHour',
        'court.publicUrl',
        'court.address',
        'createdBy.id',
        'createdBy.fullName',
        'sessions.id',
        'sessions.name',
        'sessions.description',
        'sessions.sessionNumber',
        'sessions.scheduleDate',
        'sessions.startTime',
        'sessions.endTime',
      ]);

      const [courses, total] = await queryBuilder.getManyAndCount();

      const result = new PaginateObject<Course>();
      Object.assign(result, {
        items: courses,
        page,
        pageSize: size,
        total,
      });

      return result;
    });
  }

  async findCoachCourses(
    page: number = 1,
    size: number = 10,
  ): Promise<PaginateObject<Course>> {
    return await this.datasource.transaction(async (manager) => {
      const offset = (page - 1) * size;

      const queryBuilder = manager
        .getRepository(Course)
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.schedules', 'schedules')
        .leftJoinAndSelect('course.court', 'court')
        .where('course.createdBy = :userId', {
          userId: this.request.user.id as User['id'],
        })
        .skip(offset)
        .take(size)
        .orderBy('course.createdAt', 'DESC')
        .select([
          'course.id',
          'course.name',
          'course.description',
          'course.status',
          'course.cancellingReason',
          'course.progressPct',
          'course.startDate',
          'course.endDate',
          'course.level',
          'course.learningFormat',
          'course.publicUrl',
          'course.currentParticipants',
          'course.minParticipants',
          'course.maxParticipants',
          'course.totalEarnings',
          'course.totalSessions',
          'course.createdAt',
          'course.updatedAt',
          'schedules.id',
          'schedules.dayOfWeek',
          'schedules.startTime',
          'schedules.endTime',
          'schedules.totalSessions',
          'court.id',
          'court.name',
          'court.phoneNumber',
          'court.pricePerHour',
          'court.publicUrl',
          'court.address',
        ]);

      const [courses, total] = await queryBuilder.getManyAndCount();

      const result = new PaginateObject<Course>();
      Object.assign(result, {
        items: courses,
        page,
        pageSize: size,
        total,
      });
      return result;
    });
  }

  async findLearnerCourses(
    page: number = 1,
    size: number = 10,
  ): Promise<PaginateObject<Course>> {
    return await this.datasource.transaction(async (manager) => {
      const offset = (page - 1) * size;
      const queryBuilder = manager
        .getRepository(Course)
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.enrollments', 'enrollments')
        .leftJoinAndSelect('course.createdBy', 'createdBy')
        .leftJoinAndSelect('enrollments.user', 'user')
        .where('enrollments.user.id = :userId', {
          userId: this.request.user.id as User['id'],
        })
        .andWhere('course.status != :status', {
          status: CourseStatus.CANCELLED,
        })
        .skip(offset)
        .take(size)
        .orderBy('enrollments.enrolledAt', 'DESC')
        .select([
          'course.id',
          'course.name',
          'course.description',
          'course.status',
          'course.cancellingReason',
          'course.progressPct',
          'course.startDate',
          'course.endDate',
          'course.level',
          'course.learningFormat',
          'course.publicUrl',
          'course.currentParticipants',
          'course.minParticipants',
          'course.maxParticipants',
          'course.totalEarnings',
          'course.totalSessions',
          'course.createdAt',
          'course.updatedAt',
          'createdBy.id',
          'createdBy.fullName',
          'enrollments.enrolledAt',
        ]);
      const [courses, total] = await queryBuilder.getManyAndCount();
      const result = new PaginateObject<Course>();
      Object.assign(result, {
        items: courses,
        page,
        pageSize: size,
        total,
      });
      return result;
    });
  }

  async createCourseCreationRequest(
    subjectId: number,
    data: CreateCourseRequestDto,
    file?: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const court = await manager.getRepository(Court).findOne({
        where: { id: data.court },
        withDeleted: false,
      });
      if (!court) throw new BadRequestException('Không tìm thấy sân tập');

      for (const s1 of data.schedules) {
        for (const s2 of data.schedules) {
          if (
            s1.dayOfWeek === s2.dayOfWeek &&
            !(
              (DateTimeUtils.toMinutes(s1.endTime) <
                DateTimeUtils.toMinutes(s2.startTime) &&
                DateTimeUtils.toMinutes(s1.endTime) <
                  DateTimeUtils.toMinutes(s2.endTime)) ||
              (DateTimeUtils.toMinutes(s1.startTime) >
                DateTimeUtils.toMinutes(s2.endTime) &&
                DateTimeUtils.toMinutes(s1.startTime) >
                  DateTimeUtils.toMinutes(s2.startTime))
            ) &&
            s1 !== s2
          ) {
            throw new BadRequestException(
              `Lịch học bị trùng: ${s1.dayOfWeek} ${s1.startTime} - ${s1.endTime}`,
            );
          }
        }
      }
      const courseStartDateConfig = await this.configurationService.findByKey(
        'course_start_date_after_days_from_now',
      );
      if (
        data.startDate.getTime() <
        Date.now() +
          Number(courseStartDateConfig.metadata.value) * 24 * 60 * 60 * 1000
      ) {
        throw new BadRequestException(
          `Ngày bắt đầu khóa học phải cách ngày hiện tại ít nhất ${courseStartDateConfig.metadata.value} ngày`,
        );
      }

      const subjectQueryBuilder = manager
        .getRepository(Subject)
        .createQueryBuilder('subject')
        .leftJoinAndSelect('subject.lessons', 'lessons')
        .leftJoinAndSelect('subject.courses', 'courses')
        .leftJoinAndSelect('lessons.quiz', 'quiz')
        .leftJoinAndSelect('quiz.questions', 'questions')
        .leftJoinAndSelect('questions.options', 'options')
        .leftJoinAndSelect('lessons.video', 'video')
        .where('subject.id = :subjectId', { subjectId: subjectId })
        .andWhere('subject.status = :status', {
          status: SubjectStatus.PUBLISHED,
        })
        .andWhere('lessons.deletedAt IS NULL');
      const subject = await subjectQueryBuilder.getOne();
      if (!subject) throw new BadRequestException('Không tìm thấy chủ đề');
      if (
        (subject.lessons && subject.lessons.length === 0) ||
        !subject.lessons
      ) {
        throw new BadRequestException('Tài liệu khóa học chưa đầy đủ');
      }

      const scheduleLength = (data.schedules as Schedule[]).length;
      const lessonCount = subject.lessons ? subject.lessons.length : 0;
      if (scheduleLength > lessonCount) {
        throw new BadRequestException(
          `Số lượng lịch học ${scheduleLength} không thể lớn hơn số buổi học ${lessonCount}`,
        );
      }
      if (lessonCount % scheduleLength !== 0) {
        throw new BadRequestException(
          `Số buổi học của khóa: ${lessonCount} không phù hợp với lịch đã chọn ${scheduleLength}. Ví dụ: nếu có 10 buổi học thì phải có 2 hoặc 5 lịch học`,
        );
      }

      const courseEndDate = await this.calculateCourseEndDate(
        data.startDate,
        subject.lessons ? subject.lessons.length : 0,
        data.schedules as Schedule[],
      );

      for (const schedule of data.schedules) {
        const isValid = await this.scheduleService.isNewScheduleValid(
          schedule as Schedule,
          this.request.user.id as User['id'],
          data.startDate,
          courseEndDate,
        );
        if (!isValid) {
          throw new BadRequestException(
            `Lịch vào ${schedule.dayOfWeek} ${schedule.startTime} - ${schedule.endTime} bị trùng với lịch đã có`,
          );
        }
      }

      let publicUrl: string | undefined;
      if (file?.path) {
        publicUrl = await this.bunnyService.uploadToStorage({
          id: CryptoUtils.generateRandomNumber(10_000, 999_999),
          type: 'course_image',
          filePath: file.path,
        });
      }

      const newCourse = this.courseRepository.create({
        ...data,
        court: data.court ? ({ id: data.court } as Court) : undefined,
        schedules: data.schedules.map((s) => ({
          ...s,
          totalSessions: lessonCount / scheduleLength,
        })) as Schedule[],
        publicUrl,
        name:
          subject.name +
          ` -  Khóa ${subject.courses ? subject.courses.length + 1 : 1}`,
        description: subject.description ? subject.description || '' : '',
        order: subject.courses ? subject.courses.length + 1 : 1,
        totalSessions: subject.lessons ? subject.lessons.length : 0,
        level: subject.level,
        endDate: courseEndDate,
        subject: subject,
        createdBy: this.request.user as User,
      } as unknown as Course);

      const savedCourse = await manager.getRepository(Course).save(newCourse);

      const newCourseCreationRequest = this.requestRepository.create({
        description: `Tạo khóa học: ${subject.name} - Khóa ${
          subject.courses ? subject.courses.length + 1 : 1
        }`,
        type: RequestType.COURSE_APPROVAL,
        metadata: {
          type: 'course',
          id: savedCourse.id,
          details: savedCourse,
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
  async updateCourseCreationRequest(
    courseId: number,
    data: UpdateCourseDto,
    file?: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      console.log(data);
      // Find the existing course
      const existingCourse = await manager.getRepository(Course).findOne({
        where: { id: courseId },
        relations: ['subject', 'schedules', 'court'],
      });
      if (!existingCourse) {
        throw new BadRequestException('Không tìm thấy khóa học');
      }

      // Validations similar to create
      const court = await manager.getRepository(Court).findOne({
        where: { id: data.court },
        withDeleted: false,
      });
      if (!court) throw new BadRequestException('Không tìm thấy sân tập');

      // Validate schedules don't conflict internally
      for (const s1 of data.schedules) {
        for (const s2 of data.schedules) {
          if (
            s1.dayOfWeek === s2.dayOfWeek &&
            !(
              (DateTimeUtils.toMinutes(s1.endTime) <
                DateTimeUtils.toMinutes(s2.startTime) &&
                DateTimeUtils.toMinutes(s1.endTime) <
                  DateTimeUtils.toMinutes(s2.endTime)) ||
              (DateTimeUtils.toMinutes(s1.startTime) >
                DateTimeUtils.toMinutes(s2.endTime) &&
                DateTimeUtils.toMinutes(s1.startTime) >
                  DateTimeUtils.toMinutes(s2.startTime))
            ) &&
            s1 !== s2
          ) {
            throw new BadRequestException(
              `Lịch học bị trùng: ${s1.dayOfWeek} ${s1.startTime} - ${s1.endTime}`,
            );
          }
        }
      }

      // Re-validate start date and schedules constraints, like in create
      const courseStartDateConfig = await this.configurationService.findByKey(
        'course_start_date_after_days_from_now',
      );
      if (
        data.startDate.getTime() <
        Date.now() +
          Number(courseStartDateConfig.metadata.value) * 24 * 60 * 60 * 1000
      ) {
        throw new BadRequestException(
          `Ngày bắt đầu khóa học phải cách ngày hiện tại ít nhất ${courseStartDateConfig.metadata.value} ngày`,
        );
      }

      const subject = await manager.getRepository(Subject).findOne({
        where: {
          courses: {
            id: courseId,
          },
          status: SubjectStatus.PUBLISHED,
        },
        relations: ['lessons', 'courses'],
        withDeleted: false,
      });
      if (!subject) throw new BadRequestException('Không tìm thấy chủ đề');
      if (!subject.lessons || subject.lessons.length === 0) {
        throw new BadRequestException('Tài liệu khóa học chưa đầy đủ');
      }

      const scheduleLength = data.schedules.length;
      const lessonCount = subject.lessons.length;
      if (scheduleLength > lessonCount) {
        throw new BadRequestException(
          `Số lượng lịch học ${scheduleLength} không thể lớn hơn số buổi học ${lessonCount}`,
        );
      }
      if (lessonCount % scheduleLength !== 0) {
        throw new BadRequestException(
          `Số buổi học của khóa: ${lessonCount} không phù hợp với lịch đã chọn ${scheduleLength}. Ví dụ: nếu có 10 buổi học thì phải có 2 hoặc 5 lịch học`,
        );
      }

      const courseEndDate = await this.calculateCourseEndDate(
        data.startDate,
        lessonCount,
        data.schedules as Schedule[],
      );

      for (const schedule of data.schedules) {
        const isValid = await this.scheduleService.isNewScheduleValid(
          schedule as Schedule,
          this.request.user.id as User['id'],
          data.startDate,
          courseEndDate,
          courseId,
        );
        if (!isValid) {
          throw new BadRequestException(
            `Lịch vào ${schedule.dayOfWeek} ${schedule.startTime} - ${schedule.endTime} bị trùng với lịch đã có`,
          );
        }
      }

      // Handle optional file update
      let publicUrl = existingCourse.publicUrl;
      if (file?.path) {
        publicUrl = await this.bunnyService.uploadToStorage({
          id:
            typeof this.request.user?.id === 'number'
              ? this.request.user.id
              : Number(this.request.user?.id ?? Date.now()),
          type: 'course_image',
          filePath: file.path,
        });
      }

      // Update existing course with new data
      existingCourse.name =
        subject.name +
        ` - Khóa ${subject.courses ? subject.courses.length : 1}`;
      existingCourse.description = subject.description || '';
      existingCourse.court = data.court
        ? ({ id: data.court } as Court)
        : undefined;
      existingCourse.schedules = data.schedules.map((s) => ({
        ...s,
        totalSessions: lessonCount / scheduleLength,
      })) as Schedule[];
      existingCourse.publicUrl = publicUrl;
      existingCourse.order = subject.courses ? subject.courses.length : 1;
      existingCourse.totalSessions = lessonCount;
      existingCourse.level = subject.level;
      existingCourse.endDate = courseEndDate;
      existingCourse.startDate = data.startDate;
      existingCourse.subject = subject;

      await manager.getRepository(Course).save(existingCourse);

      // Optionally update related request or notification for course update approval
      // (Feel free to customize this part based on your business logic)

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Chỉnh sửa khóa học thành công',
      );
    });
  }

  async approveCourseCreationRequest(
    id: number,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const request = await manager.getRepository(Request).findOne({
        where: { id: id },
        relations: ['createdBy', 'actions'],
      });
      if (!request) throw new BadRequestException('Không tìm thấy yêu cầu');
      if (request.status === RequestStatus.APPROVED)
        throw new BadRequestException('Yêu cầu không được chờ duyệt');

      const courseQueryBuilder = manager
        .getRepository(Course)
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.subject', 'subject')
        .leftJoinAndSelect('course.createdBy', 'createdBy')
        .leftJoinAndSelect('subject.lessons', 'lessons')
        .leftJoinAndSelect('lessons.video', 'video')
        .leftJoinAndSelect('lessons.quiz', 'quiz')
        .leftJoinAndSelect('quiz.questions', 'questions')
        .leftJoinAndSelect('questions.options', 'options')
        .where('course.id = :courseId', { courseId: request.metadata.id })
        .andWhere('course.deletedAt IS NULL');

      const course = await courseQueryBuilder.getOne();
      if (!course) throw new BadRequestException('Không tìm thấy khóa học');
      if (course.totalSessions <= 0)
        throw new BadRequestException('Khóa học chưa có buổi học nào');

      if (
        request.metadata.details.schedules &&
        request.metadata.details.schedules.length > 0
      ) {
        const sessions =
          await this.sessionService.generateSessionsFromSchedules(
            course,
            request.metadata.details.schedules,
          );
        for (const lesson of course.subject.lessons) {
          const session = sessions.find((ses) => ses.lesson.id === lesson.id);
          if (session) {
            delete lesson.video.id;
            session.video = {
              ...lesson.video,
              status: CoachVideoStatus.READY,
              lesson: null,
              session: session,
              uploadedBy: course.createdBy,
            };

            delete lesson.quiz.id;
            for (const question of lesson.quiz.questions) {
              delete question.id;
              for (const option of question.options) {
                delete option.id;
              }
            }
            session.quiz = {
              ...lesson.quiz,
              lesson: null,
              session: session,
              createdBy: course.createdBy,
            };
          }
        }

        await manager.getRepository(Session).save(sessions);
      }

      course.status = CourseStatus.APPROVED;
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
      const request = await manager.getRepository(Request).findOne({
        where: { id: id },
        relations: ['createdBy', 'actions'],
      });
      if (!request) throw new BadRequestException('Không tìm thấy yêu cầu');
      if (
        request.status === RequestStatus.REJECTED ||
        request.status === RequestStatus.APPROVED
      )
        throw new BadRequestException('Yêu cầu không được chờ duyệt');

      const course = await manager.getRepository(Course).findOne({
        where: { id: request.metadata.id },
        withDeleted: false,
      });
      if (!course) throw new BadRequestException('Không tìm thấy khóa học');

      course.status = CourseStatus.REJECTED;
      await manager.getRepository(Course).save(course);

      request.status = RequestStatus.REJECTED;
      await manager.getRepository(Request).save(request);

      const newRequestAction = manager.getRepository(RequestAction).create({
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
      const course = await manager.getRepository(Course).findOne({
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
      const course = await manager.getRepository(Course).findOne({
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
      const checkCourseBeforeDays = await this.configurationService.findByKey(
        'course_start_before_days',
      );
      if (
        new Date(course.startDate).getTime() +
          Number(checkCourseBeforeDays.metadata.value) * 24 * 60 * 60 * 1000 <=
        Date.now()
      ) {
        throw new BadRequestException('Không thể hủy khóa học');
      }

      const enrollment = await manager.getRepository(Enrollment).findOne({
        where: {
          course: { id: course.id },
          user: { id: this.request.user.id as User['id'] },
        },
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

      const platformFeeConfig = await this.configurationService.findByKey(
        'platform_fee_per_percentage',
      );
      course.totalEarnings -=
        (Number(course.pricePerParticipant) *
          (100 - Number(platformFeeConfig.metadata.value))) /
        100;

      switch (course.learningFormat) {
        case CourseLearningFormat.INDIVIDUAL:
          course.status = CourseStatus.APPROVED;
          break;
        case CourseLearningFormat.GROUP:
          if (
            course.currentParticipants >= course.minParticipants &&
            course.currentParticipants < course.maxParticipants
          ) {
            course.status = CourseStatus.READY_OPENED;
            for (const enr of course.enrollments) {
              if (enr.status === EnrollmentStatus.PENDING_GROUP) {
                enr.status = EnrollmentStatus.CONFIRMED;
                await this.enrollmentRepository.save(enr);
              }
            }
          } else if (course.currentParticipants >= course.maxParticipants) {
            course.status = CourseStatus.FULL;
            for (const enr of course.enrollments) {
              if (enr.status === EnrollmentStatus.PENDING_GROUP) {
                enr.status = EnrollmentStatus.CONFIRMED;
                await this.enrollmentRepository.save(enr);
              }
            }
          } else if (course.currentParticipants < course.minParticipants) {
            course.status = CourseStatus.APPROVED;
            for (const enr of course.enrollments) {
              if (enr.status === EnrollmentStatus.CONFIRMED) {
                enr.status = EnrollmentStatus.PENDING_GROUP;
                await this.enrollmentRepository.save(enr);
              }
            }
          }
          break;
      }

      await manager.getRepository(Course).save(course);

      await this.notificationService.sendNotification({
        userId: course.createdBy.id,
        title: 'Học viên hủy đăng ký khóa học',
        body: `Một học viên đã hủy đăng ký khóa học của bạn.`,
        navigateTo: `/coach/courses/${course.id}`,
        type: NotificationType.INFO,
      });

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'COURSE.CANCEL_SUCCESS',
      );
    });
  }

  async calculateCourseEndDate(
    startDate: Date,
    totalSessions: number,
    schedules: Schedule[],
  ): Promise<Date> {
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
