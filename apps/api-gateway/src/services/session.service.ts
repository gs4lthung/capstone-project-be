import { Course } from '@app/database/entities/course.entity';
import { Schedule } from '@app/database/entities/schedule.entity';
import { Session } from '@app/database/entities/session.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { SessionStatus } from '@app/shared/enums/session.enum';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class SessionService extends BaseTypeOrmService<Session> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {
    super(sessionRepository);
  }
  generateSessionsFromSchedules(
    course: Course,
    schedules: Schedule[],
  ): Session[] {
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
          const scheduleStartTime = this.timeStringToMinutes(
            schedule.startTime,
          );
          const scheduleEndTime = this.timeStringToMinutes(schedule.endTime);
          const duration = scheduleEndTime - scheduleStartTime;

          const session = this.sessionRepository.create({
            sessionNumber: sessionNumber,
            scheduleDate: new Date(currentDate),
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            durationInMinutes: duration,
            status: SessionStatus.SCHEDULED,
            course: course,
          });
          sessions.push(session);
          sessionNumber++;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return sessions;
  }

  private timeStringToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
