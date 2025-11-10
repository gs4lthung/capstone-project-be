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

    // Helpers: schedules store time-of-day like "9:00" or "17:00" (or with seconds).
    // We compare time-of-day in minutes and course dates as date-only millis to
    // avoid issues when parsing time-only strings with `new Date()`.
    const parseTimeToMinutes = (v: Date | string | number) => {
      if (v instanceof Date) return v.getHours() * 60 + v.getMinutes();
      if (typeof v === 'number') {
        const d = new Date(v);
        return d.getHours() * 60 + d.getMinutes();
      }
      // string like "9:00" or "09:00:00"
      const parts = String(v)
        .split(':')
        .map((p) => parseInt(p, 10));
      const h = Number.isFinite(parts[0]) ? parts[0] : 0;
      const m = parts.length > 1 && Number.isFinite(parts[1]) ? parts[1] : 0;
      return h * 60 + m;
    };

    const toDateOnlyMillis = (v: Date | string | number) => {
      const d = v instanceof Date ? new Date(v) : new Date(String(v));
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };

    const newStart = parseTimeToMinutes(schedule.startTime);
    const newEnd = parseTimeToMinutes(schedule.endTime);
    const courseStart = toDateOnlyMillis(courseStartDate);
    const courseEnd = toDateOnlyMillis(courseEndDate);

    for (const existing of existingSchedules) {
      // skip self when updating
      if (schedule.id && existing.id === schedule.id) continue;

      if (!existing.course) continue; // defensive

      const exStart = parseTimeToMinutes(existing.startTime);
      const exEnd = parseTimeToMinutes(existing.endTime);
      const exCourseStart = toDateOnlyMillis(existing.course.startDate);
      const exCourseEnd = toDateOnlyMillis(existing.course.endDate);

      const timesOverlap = newStart < exEnd && newEnd > exStart;
      const courseDatesOverlap =
        courseStart <= exCourseEnd && courseEnd >= exCourseStart;

      if (timesOverlap && courseDatesOverlap) return true;
    }
    return false;
  }
}
