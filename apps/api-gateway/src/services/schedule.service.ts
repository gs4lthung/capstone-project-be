import { Schedule } from '@app/database/entities/schedule.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class ScheduleService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

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

  async isNewScheduleValid(
    schedule: Schedule,
    coachUserId: number,
    courseStartDate: Date,
    courseEndDate: Date,
  ): Promise<boolean> {
    // helper to normalize dates to midnight timestamps for date-only comparison
    const toDateTimestamp = (d: Date | string): number => {
      const date = d instanceof Date ? d : new Date(d);
      const normalized = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      return normalized.getTime();
    };

    // helper to convert a time value to minutes since midnight
    // accepts Date, "HH:MM[:SS]" strings, or numeric minutes
    const toMinutes = (t: Date | string | number): number => {
      if (typeof t === 'number') return t;
      if (t instanceof Date) return t.getHours() * 60 + t.getMinutes();
      const parts = (t || '').split(':').map((p) => parseInt(p, 10));
      const hours = Number.isFinite(parts[0]) ? parts[0] : 0;
      const minutes = Number.isFinite(parts[1]) ? parts[1] : 0;
      return hours * 60 + minutes;
    };

    // load related course and creator; exclude rejected statuses by default
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
          status: In(statuses),
          createdBy: { id: coachUserId },
        },
      },
      relations: ['course', 'course.createdBy'],
    });

    const newStartDateTs = toDateTimestamp(courseStartDate);
    const newEndDateTs = toDateTimestamp(courseEndDate);
    const newStartMinutes = toMinutes(schedule.startTime);
    const newEndMinutes = toMinutes(schedule.endTime);

    for (const existingSchedule of existingSchedules) {
      const existStartDateTs = toDateTimestamp(
        existingSchedule.course.startDate,
      );
      const existEndDateTs = toDateTimestamp(existingSchedule.course.endDate);

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
          const existStartMinutes = toMinutes(existingSchedule.startTime);
          const existEndMinutes = toMinutes(existingSchedule.endTime);

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
