import { Attendance } from '@app/database/entities/attendance.entity';
import { Course } from '@app/database/entities/course.entity';
import { Schedule } from '@app/database/entities/schedule.entity';
import { Session } from '@app/database/entities/session.entity';
import { Subject } from '@app/database/entities/subject.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  CompleteSessionDto,
  GetSessionForWeeklyCalendarRequestDto,
} from '@app/shared/dtos/sessions/session.dto';
import {
  SessionEarningStatus,
  SessionStatus,
} from '@app/shared/enums/session.enum';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, Repository } from 'typeorm';
import { WalletService } from './wallet.service';
import { ConfigurationService } from './configuration.service';
import { SessionEarning } from '@app/database/entities/session-earning.entity';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { LearnerProgress } from '@app/database/entities/learner-progress.entity';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { UserRole } from '@app/shared/enums/user.enum';
import { NotificationService } from './notification.service';
import { NotificationType } from '@app/shared/enums/notification.enum';
import { Configuration } from '@app/database/entities/configuration.entity';

@Injectable({ scope: Scope.REQUEST })
export class SessionService extends BaseTypeOrmService<Session> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(SessionEarning)
    private readonly sessionEarningRepository: Repository<SessionEarning>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(LearnerProgress)
    private readonly learnerProgressRepository: Repository<LearnerProgress>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Configuration)
    private readonly configurationRepository: Repository<Configuration>,
    private readonly walletService: WalletService,
    private readonly configurationService: ConfigurationService,
    private readonly datasource: DataSource,
    private readonly notificationService: NotificationService,
  ) {
    super(sessionRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginateObject<Session>> {
    return super.find(findOptions, 'session', PaginateObject<Session>);
  }

  async findOne(id: number): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id: id },
      withDeleted: false,
      relations: [
        'course',
        'course.enrollments',
        'course.enrollments.user',
        'lesson',
        'attendances',
        'notes',
        'quizzes',
        'quizzes.questions',
        'quizzes.questions.options',
        'videos',
      ],
    });

    if (!session) throw new Error('Session not found');

    return session;
  }

  async findByCourseId(courseId: number): Promise<Session[]> {
    const sessions = await this.sessionRepository.find({
      where: { course: { id: courseId } },
      withDeleted: false,
      relations: ['course', 'lesson', 'attendances', 'quizzes', 'videos'],
      order: {
        scheduleDate: 'ASC',
        startTime: 'ASC',
      },
    });

    return sessions;
  }

  async getSessionsForWeeklyCalendar(
    data: GetSessionForWeeklyCalendarRequestDto,
  ): Promise<CustomApiResponse<Session[]>> {
    // validate input dates
    if (!data?.startDate || !data?.endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const startOfWeek = new Date(data.startDate);
    const endOfWeek = new Date(data.endDate);

    if (isNaN(startOfWeek.getTime()) || isNaN(endOfWeek.getTime())) {
      throw new BadRequestException('Invalid startDate or endDate');
    }

    if (endOfWeek < startOfWeek) {
      throw new BadRequestException(
        'endDate must be the same or after startDate',
      );
    }

    // normalize to include full days
    startOfWeek.setHours(0, 0, 0, 0);
    endOfWeek.setHours(23, 59, 59, 999);

    const user = await this.userRepository.findOne({
      where: { id: this.request.user.id as User['id'] },
      withDeleted: false,
      relations: ['role'],
    });
    if (!user) throw new InternalServerErrorException('Lỗi server');

    switch (user.role.name) {
      case UserRole.COACH:
        const sessions = await this.sessionRepository.find({
          where: {
            course: {
              createdBy: { id: this.request.user.id as User['id'] },
            },
            scheduleDate: Between(startOfWeek, endOfWeek),
            status: In([SessionStatus.SCHEDULED, SessionStatus.COMPLETED]),
          },
          relations: [
            'course',
            'course.enrollments',
            'quizzes',
            'quizzes.questions',
            'quizzes.questions.options',
            'videos',
          ],
        });

        return new CustomApiResponse<Session[]>(
          HttpStatus.OK,
          'Sessions retrieved successfully',
          sessions,
        );
      case UserRole.LEARNER:
        const learnerSessions = await this.sessionRepository.find({
          where: {
            course: {
              enrollments: {
                user: { id: this.request.user.id as User['id'] },
              },
            },
            scheduleDate: Between(startOfWeek, endOfWeek),
          },
          relations: ['course'],
        });
        return new CustomApiResponse<Session[]>(
          HttpStatus.OK,
          'Sessions retrieved successfully',
          learnerSessions,
        );
      default:
        throw new BadRequestException('Invalid user role for sessions');
    }
  }

  async completeAndCheckAttendance(
    id: number,
    data: CompleteSessionDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const session = await this.sessionRepository.findOne({
        where: { id: id },
        relations: ['course'],
        withDeleted: false,
      });
      if (!session) throw new BadRequestException('Buổi học không tồn tại');
      if (session.status !== SessionStatus.SCHEDULED) {
        throw new BadRequestException('Buổi học chưa được lên lịch');
      }

      if (this.getSessionTimeStatus(session) !== 'finished') {
        throw new BadRequestException('Buổi học chưa kết thúc');
      }

      const course = await this.courseRepository.findOne({
        where: { id: session.course.id },
        relations: ['enrollments', 'enrollments.user'],
        withDeleted: false,
      });
      if (!course) throw new InternalServerErrorException('Lỗi server');
      if (!course.totalEarnings)
        throw new InternalServerErrorException('Lỗi server');

      const isCheckAllLearnerAttendance =
        data.attendances.length === course.enrollments.length;
      if (!isCheckAllLearnerAttendance) {
        throw new BadRequestException(
          'Phải kiểm tra điểm danh cho tất cả học viên đã đăng ký',
        );
      }

      const feeConfig = await this.configurationService.findByKey(
        'platform_fee_per_percentage',
      );
      const feePercentage = Number(feeConfig?.metadata.value);
      if (Number.isNaN(feePercentage))
        throw new InternalServerErrorException('Giá trị cấu hình không hợp lệ');

      const sessionEarning =
        (course.totalEarnings * (100 - feePercentage)) /
        100 /
        course.totalSessions;
      const sessionEarningRecord = this.sessionEarningRepository.create({
        sessionPrice: Number(sessionEarning),
        coachEarningTotal: Number(sessionEarning),
        status: SessionEarningStatus.PAID,
        paidAt: new Date(),
        session: session,
      });
      await manager.getRepository(SessionEarning).save(sessionEarningRecord);
      await manager.getRepository(Session).update(id, {
        status: SessionStatus.COMPLETED,
        completedAt: new Date(),
      });

      const learnerProgress = await this.learnerProgressRepository.findOne({
        where: {
          course: course,
          user: this.request.user as User,
        },
        withDeleted: false,
      });
      if (learnerProgress) {
        learnerProgress.sessionsCompleted += 1;
        await manager.getRepository(LearnerProgress).save(learnerProgress);
      }

      for (const attendanceDto of data.attendances) {
        const attendance = this.attendanceRepository.create({
          user: { id: attendanceDto.userId as User['id'] },
          session: session,
          status: attendanceDto.status,
        });
        await manager.getRepository(Attendance).save(attendance);
      }

      const completeBefourHours = await this.configurationRepository.findOne({
        where: { key: 'complete_session_before_hours' },
      });
      const hoursBefore = completeBefourHours
        ? Number(completeBefourHours.value)
        : 0;
      const sessionEndTime = new Date(session.scheduleDate);
      const [eh, em] = session.endTime.split(':').map(Number);
      sessionEndTime.setHours(eh, em, 0, 0);
      const allowedCompleteTime = new Date(
        sessionEndTime.getTime() + hoursBefore * 60 * 60 * 1000,
      );
      if (new Date() <= allowedCompleteTime)
        await this.walletService.handleWalletTopUp(
          this.request.user.id as User['id'],
          sessionEarning,
        );

      const totalSessions = await this.sessionRepository.count({
        where: { course: { id: course.id } },
      });
      const completedSessions = await this.sessionRepository.count({
        where: {
          course: { id: course.id },
          status: SessionStatus.COMPLETED,
        },
      });

      const progressPct = Math.floor((completedSessions / totalSessions) * 100);
      await manager.getRepository(Course).update(course.id, {
        progressPct: progressPct,
      });

      if (totalSessions === completedSessions) {
        await manager.getRepository(Course).update(course.id, {
          status: CourseStatus.COMPLETED,
        });
      }

      for (const enrollment of course.enrollments) {
        await this.notificationService.sendNotification({
          userId: enrollment.user.id,
          title: 'Buổi học đã hoàn thành',
          body: `Buổi học ${session.name} của khóa học ${course.name} đã được hoàn thành. Bạn có thể bắt đầu làm các bài tập liên quan.`,
          navigateTo: `/learner/courses/${course.id}/sessions/${session.id}`,
          type: NotificationType.SUCCESS,
        });
      }

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        `Điểm danh và hoàn thành buổi học thành công` +
          (new Date() <= allowedCompleteTime
            ? ', bạn đã nhận được ' + sessionEarning + ' vào ví của mình.'
            : ', nhưng buổi học đã hoàn thành quá thời gian quy định để nhận tiền.'),
      );
    });
  }

  async generateSessionsFromSchedules(
    course: Course,
    schedules: Schedule[],
  ): Promise<Session[]> {
    const subject = await this.subjectRepository.findOne({
      where: { id: course.subject.id },
      withDeleted: false,
    });
    if (!subject) throw new InternalServerErrorException('Lỗi server');

    const sessions: Session[] = [];
    let sessionNumber = 1;

    const dayMap: { [key: string]: number } = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const currentDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);

    while (currentDate <= endDate) {
      for (const schedule of schedules) {
        const scheduleDay = dayMap[schedule.dayOfWeek];

        if (currentDate.getDay() === scheduleDay) {
          const session = this.sessionRepository.create({
            name: `${
              subject.lessons.find(
                (lesson) => lesson.lessonNumber === sessionNumber,
              )?.name || 'Chưa có tên bài học'
            }`,
            description: `${
              subject.lessons.find(
                (lesson) => lesson.lessonNumber === sessionNumber,
              )?.description || ''
            }`,
            sessionNumber: sessionNumber,
            scheduleDate: new Date(currentDate),
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            status: SessionStatus.PENDING,
            course: course,
            lesson: subject
              ? subject.lessons.find(
                  (lesson) => lesson.lessonNumber === sessionNumber,
                )
              : null,
          });
          sessions.push(session);
          sessionNumber++;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return sessions;
  }

  public getSessionTimeStatus(
    session: Session,
  ): 'upcoming' | 'ongoing' | 'finished' | 'invalid' {
    if (
      !session ||
      !session.scheduleDate ||
      !session.startTime ||
      !session.endTime
    )
      return 'invalid';

    const start = new Date(session.scheduleDate);
    const [sh, sm] = session.startTime.split(':').map(Number);
    start.setHours(sh, sm, 0, 0);

    const end = new Date(session.scheduleDate);
    const [eh, em] = session.endTime.split(':').map(Number);
    end.setHours(eh, em, 0, 0);

    // if end is equal or before start assume it finishes the next day
    if (end <= start) end.setDate(end.getDate() + 1);

    const now = new Date();

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'finished';
  }

  public isSessionActive(session: Session): boolean {
    return this.getSessionTimeStatus(session) === 'ongoing';
  }

  private timeStringToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
