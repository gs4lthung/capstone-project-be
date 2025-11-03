import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Course } from '@app/database/entities/course.entity';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { Enrollment } from '@app/database/entities/enrollment.entity';
import { In } from 'typeorm';
import { EnrollmentStatus } from '@app/shared/enums/enrollment.enum';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  private readonly logger = new Logger(CronService.name);

  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleStartCourse() {
    this.logger.log('Check for courses to start');
    const courses = await this.courseRepository.find({
      where: { status: In([CourseStatus.FULL, CourseStatus.READY_OPENED]) },
      withDeleted: false,
      relations: ['enrollments'],
    });

    for (const course of courses) {
      if (new Date(course.startDate) === new Date()) {
        this.logger.log(`Start course ${course.id}`);
        course.status = CourseStatus.ON_GOING;
        for (const enrollment of course.enrollments) {
          enrollment.status = EnrollmentStatus.LEARNING;
        }
        await this.courseRepository.save(course);
      }
    }
  }
}
