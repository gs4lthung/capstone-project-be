import { Attendance } from '@app/database/entities/attendance.entity';
import { Course } from '@app/database/entities/course.entity';
import { Schedule } from '@app/database/entities/schedule.entity';
import {
  Session,
  PaginatedSession,
} from '@app/database/entities/session.entity';
import { Subject } from '@app/database/entities/subject.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CompleteSessionDto } from '@app/shared/dtos/sessions/session.dto';
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
import { Repository } from 'typeorm';
import { WalletService } from './wallet.service';
import { ConfigurationService } from './configuration.service';
import { SessionEarning } from '@app/database/entities/session-earning.entity';

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
    private readonly walletService: WalletService,
    private readonly configurationService: ConfigurationService,
  ) {
    super(sessionRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginatedSession> {
    return super.find(findOptions, 'session', PaginatedSession);
  }

  async findOne(id: number): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id: id },
      withDeleted: false,
      relations: ['course', 'lesson', 'attendances', 'notes'],
    });

    if (!session) throw new Error('Session not found');

    return session;
  }

  async completeAndCheckAttendance(
    id: number,
    data: CompleteSessionDto,
  ): Promise<CustomApiResponse<void>> {
    const session = await this.sessionRepository.findOne({
      where: { id: id },
      relations: ['course'],
      withDeleted: false,
    });
    if (!session) throw new BadRequestException('Session not found');
    if (session.status !== SessionStatus.SCHEDULED) {
      throw new BadRequestException('Session is not in scheduled status');
    }

    if (this.getSessionTimeStatus(session) !== 'finished') {
      throw new BadRequestException('Session is not finished yet');
    }

    const course = await this.courseRepository.findOne({
      where: { id: session.course.id },
      relations: ['enrollments'],
      withDeleted: false,
    });
    if (!course) throw new InternalServerErrorException('Lỗi server');
    if (!course.totalEarnings)
      throw new InternalServerErrorException('Lỗi server');

    const isCheckAllLearnerAttendance =
      data.attendances.length === course.enrollments.length;
    if (!isCheckAllLearnerAttendance) {
      throw new BadRequestException(
        'Attendance for all enrolled learners must be checked',
      );
    }

    const feeConfig = await this.configurationService.findByKey(
      'platform_fee_per_percentage',
    );
    const feePercentage = Number(feeConfig?.value);
    if (Number.isNaN(feePercentage))
      throw new InternalServerErrorException('Invalid configuration value');

    const sessionEarning =
      (course.totalEarnings * (100 - feePercentage)) /
      100 /
      course.totalSessions;
    const sessionEarningRecord = this.sessionEarningRepository.create({
      sessionPrice: sessionEarning,
      coachEarningTotal: sessionEarning,
      status: SessionEarningStatus.PAID,
      paidAt: new Date(),
      session: session,
    });
    await this.sessionEarningRepository.save(sessionEarningRecord);
    await this.sessionRepository.update(id, {
      status: SessionStatus.COMPLETED,
      completedAt: new Date(),
    });

    for (const attendanceDto of data.attendances) {
      const attendance = this.attendanceRepository.create({
        user: { id: attendanceDto.userId as User['id'] },
        session: session,
        status: attendanceDto.status,
      });
      await this.attendanceRepository.save(attendance);
    }

    await this.walletService.handleWalletTopUp(
      this.request.user.id as User['id'],
      sessionEarning,
    );

    return new CustomApiResponse<void>(
      HttpStatus.OK,
      'Session completed and attendance recorded successfully',
    );
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
            status: SessionStatus.SCHEDULED,
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
