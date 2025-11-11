import { Course } from '@app/database/entities/course.entity';
import { Schedule } from '@app/database/entities/schedule.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { DateTimeUtils } from '@app/shared/utils/datetime.util';
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
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
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
