import { Course } from '@app/database/entities/course.entity';
import { Schedule } from '@app/database/entities/schedule.entity';
import { Session } from '@app/database/entities/session.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  ChangeScheduleDto,
  SessionNewScheduleDto,
} from '@app/shared/dtos/schedules/schedule.dto';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { SessionStatus } from '@app/shared/enums/session.enum';
import { DateTimeUtils } from '@app/shared/utils/datetime.util';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { NotificationService } from './notification.service';
import { NotificationType } from '@app/shared/enums/notification.enum';
import { Configuration } from '@app/database/entities/configuration.entity';

@Injectable({ scope: Scope.REQUEST })
export class ScheduleService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly notificationService: NotificationService,
    private readonly datasource: DataSource,
  ) {}

  async getScheduleByCourse(courseId: number): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      where: { course: { id: courseId } },
    });
  }

  async getAvailableSchedulesByCoach(): Promise<CustomApiResponse<Schedule[]>> {
    const schedules = await this.scheduleRepository.find({
      where: {
        course: {
          status: In([
            CourseStatus.APPROVED,
            CourseStatus.READY_OPENED,
            CourseStatus.FULL,
            CourseStatus.ON_GOING,
            CourseStatus.PENDING_APPROVAL,
          ]),
          createdBy: { id: this.request.user?.id as User['id'] },
        },
      },
      relations: ['course'],
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Schedules retrieved successfully',
      metadata: schedules,
    };
  }

  async changeSchedule(
    data: ChangeScheduleDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const course = await manager.getRepository(Course).findOne({
        where: { id: data.course },
        relations: ['schedules', 'createdBy'],
      });
      if (!course) {
        throw new BadRequestException('Không tìm thấy khóa học');
      }

      const isNewScheduleValid = await this.isNewScheduleValid(
        data.newSchedule as Schedule,
        course.createdBy.id,
        course.startDate,
        course.endDate,
        course.id,
      );

      if (!isNewScheduleValid) {
        throw new BadRequestException(
          'Lịch mới xung đột với lịch khóa học khác của giảng viên',
        );
      }

      const replacedSchedule = await manager.getRepository(Schedule).findOne({
        where: { id: data.replaceScheduleId },
        relations: ['sessions'],
      });

      if (!replacedSchedule) {
        throw new BadRequestException('Không tìm thấy lịch cần thay thế');
      }

      replacedSchedule.dayOfWeek = data.newSchedule.dayOfWeek;
      replacedSchedule.startTime = data.newSchedule.startTime;
      replacedSchedule.endTime = data.newSchedule.endTime;
      await manager.getRepository(Schedule).save(replacedSchedule);

      for (const session of replacedSchedule.sessions) {
        if (session.status === SessionStatus.COMPLETED) {
          continue;
        }
        session.schedule = replacedSchedule;
        session.startTime = replacedSchedule.startTime;
        session.endTime = replacedSchedule.endTime;

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
          const scheduleDay = dayMap[data.newSchedule.dayOfWeek];

          if (currentDate.getDay() === scheduleDay) {
            session.scheduleDate = new Date(currentDate);
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }
        await manager.getRepository(Session).save(session);
      }

      await manager.getRepository(Schedule).remove(replacedSchedule);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Thay đổi lịch thành công',
      );
    });
  }

  async changeSessionSchedule(
    sessionId: number,
    data: SessionNewScheduleDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const changeScheduleBeforeHours = await manager
        .getRepository(Configuration)
        .findOne({
          where: { key: 'change_schedule_before_hours' },
        });
      if (!changeScheduleBeforeHours) {
        throw new BadRequestException(
          'Cấu hình thay đổi lịch không tồn tại, vui lòng liên hệ quản trị viên',
        );
      }

      const changeScheduleBeforeHoursValue = Number(
        changeScheduleBeforeHours.value,
      );
      const currentTime = new Date();

      const changeScheduleDeadline = new Date(
        currentTime.getTime() + changeScheduleBeforeHoursValue * 60 * 60 * 1000,
      );
      if (new Date(data.scheduledDate) < changeScheduleDeadline) {
        throw new BadRequestException(
          `Chỉ được phép thay đổi lịch trước ${changeScheduleBeforeHoursValue} giờ`,
        );
      }

      const session = await manager
        .getRepository(Session)
        .createQueryBuilder('session')
        .where('session.id = :sessionId', { sessionId })
        .andWhere('session.status IN (:...statuses)', {
          statuses: [SessionStatus.PENDING, SessionStatus.SCHEDULED],
        })
        .leftJoinAndSelect('session.course', 'course')
        .leftJoinAndSelect('session.schedule', 'schedule')
        .leftJoinAndSelect('course.enrollments', 'enrollments')
        .leftJoinAndSelect('enrollments.user', 'user')
        .select([
          'session.id',
          'session.name',
          'session.scheduleDate',
          'session.startTime',
          'session.endTime',
          'session.status',
          'schedule.id',
          'schedule.dayOfWeek',
          'schedule.startTime',
          'schedule.endTime',
          'schedule.totalSessions',
          'course.id',
          'course.status',
          'enrollments.id',
          'user.id',
        ])
        .getOne();
      if (!session) {
        throw new BadRequestException('Không tìm thấy buổi học');
      }

      const oldSessions = await manager.getRepository(Session).find({
        where: {
          status: In([SessionStatus.PENDING, SessionStatus.SCHEDULED]),
          course: {
            id: session.course.id,
            status: In([
              CourseStatus.APPROVED,
              CourseStatus.READY_OPENED,
              CourseStatus.FULL,
              CourseStatus.ON_GOING,
              CourseStatus.PENDING_APPROVAL,
            ]),
          },
        },
      });

      const sessionScheduleDate = new Date(session.scheduleDate);
      const newScheduledDate = new Date(data.scheduledDate);

      for (const oldSession of oldSessions) {
        if (oldSession.id === session.id) {
          continue;
        }

        if (sessionScheduleDate.getTime() === newScheduledDate.getTime()) {
          const oldStartMinutes = DateTimeUtils.toMinutes(oldSession.startTime);
          const oldEndMinutes = DateTimeUtils.toMinutes(oldSession.endTime);
          const newStartMinutes = DateTimeUtils.toMinutes(data.startTime);
          const newEndMinutes = DateTimeUtils.toMinutes(data.endTime);
          const isTimeConflict = !(
            newStartMinutes >= oldEndMinutes || newEndMinutes <= oldStartMinutes
          );
          if (isTimeConflict) {
            throw new BadRequestException(
              'Lịch mới xung đột với buổi học khác của khóa học',
            );
          }
        }
      }

      session.scheduleDate = newScheduledDate;
      session.startTime = data.startTime;
      session.endTime = data.endTime;

      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const dayOfWeek = dayNames[new Date(data.scheduledDate).getDay()];

      const existingSchedule = await manager.getRepository(Schedule).findOne({
        where: {
          course: { id: session.course.id },
          dayOfWeek: dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
        },
      });
      if (existingSchedule) {
        session.schedule.totalSessions -= 1;
        if (session.schedule.totalSessions === 0)
          await manager.getRepository(Schedule).remove(session.schedule);
        else await manager.getRepository(Schedule).save(session.schedule);

        existingSchedule.totalSessions += 1;
        session.schedule = existingSchedule;
        await manager.getRepository(Schedule).save(existingSchedule);
        await manager.getRepository(Session).save(session);
      } else {
        session.schedule.totalSessions -= 1;
        if (session.schedule.totalSessions === 0)
          await manager.getRepository(Schedule).remove(session.schedule);
        else await manager.getRepository(Schedule).save(session.schedule);

        const newSchedule = manager.getRepository(Schedule).create({
          dayOfWeek: dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
          course: session.course,
          totalSessions: 1,
        });
        session.schedule = newSchedule;
        await manager.getRepository(Session).save(session);
      }

      for (const enrollment of session.course.enrollments) {
        await this.notificationService.sendNotification({
          userId: enrollment.user.id,
          title: 'Thay đổi lịch buổi học',
          body: `Lịch buổi học ${session.name} đã được thay đổi. Vui lòng kiểm tra lại lịch học của bạn.`,
          navigateTo: `/learner/courses/${session.course.id}/sessions`,
          type: NotificationType.INFO,
        });
      }

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Thay đổi lịch buổi học thành công',
      );
    });
  }

  async isNewScheduleValid(
    schedule: Schedule,
    coachUserId: number,
    courseStartDate: Date,
    courseEndDate: Date,
    courseId?: number,
  ): Promise<boolean> {
    const statuses = [
      CourseStatus.APPROVED,
      CourseStatus.READY_OPENED,
      CourseStatus.FULL,
      CourseStatus.ON_GOING,
      CourseStatus.PENDING_APPROVAL,
      // CourseStatus.REJECTED, // consider excluding
    ];

    const existingSchedules = await this.scheduleRepository.find({
      where: {
        course: {
          id: Not(courseId ?? 0),
          status: In(statuses),
          createdBy: { id: coachUserId },
        },
      },
      relations: ['course', 'course.createdBy'],
    });

    const newStartDateTs = DateTimeUtils.toDateTimestamp(courseStartDate);
    const newEndDateTs = DateTimeUtils.toDateTimestamp(courseEndDate);
    const newStartMinutes = DateTimeUtils.toMinutes(schedule.startTime);
    const newEndMinutes = DateTimeUtils.toMinutes(schedule.endTime);

    for (const existingSchedule of existingSchedules) {
      const existStartDateTs = DateTimeUtils.toDateTimestamp(
        existingSchedule.course.startDate,
      );
      const existEndDateTs = DateTimeUtils.toDateTimestamp(
        existingSchedule.course.endDate,
      );

      const isStartAndEndDateConflict = !(
        (newStartDateTs > existEndDateTs && newEndDateTs > existEndDateTs) ||
        (newStartDateTs < existStartDateTs && newEndDateTs < existStartDateTs)
      );

      if (isStartAndEndDateConflict) {
        console.log('Date range conflict detected');
        const isDayOfWeekConflict =
          existingSchedule.dayOfWeek === schedule.dayOfWeek;
        if (isDayOfWeekConflict) {
          console.log('Day of week conflict detected');
          const existStartMinutes = DateTimeUtils.toMinutes(
            existingSchedule.startTime,
          );
          const existEndMinutes = DateTimeUtils.toMinutes(
            existingSchedule.endTime,
          );

          const isTimeConflict = !(
            (newStartMinutes > existEndMinutes &&
              newEndMinutes > existEndMinutes) ||
            (newStartMinutes < existStartMinutes &&
              newEndMinutes < existStartMinutes)
          );

          if (isTimeConflict) {
            console.log('Time conflict detected');
            return false;
          }
        }
      }
    }

    return true;
  }
}
