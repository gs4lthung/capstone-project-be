import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Course } from '@app/database/entities/course.entity';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { In } from 'typeorm';
import { EnrollmentStatus } from '@app/shared/enums/enrollment.enum';
import { PaymentStatus } from '@app/shared/enums/payment.enum';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  private readonly logger = new Logger(CronService.name);

  @Cron(CronExpression.EVERY_DAY_AT_4AM, {
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
      if (new Date(course.startDate) >= new Date()) {
        this.logger.log(`Start course ${course.id}`);
        for (const enrollment of course.enrollments) {
          if (enrollment.status === EnrollmentStatus.PENDING_GROUP)
            if (
              enrollment.payments.filter(
                (payment) => payment.status === PaymentStatus.PAID,
              ).length > 0
            )
              enrollment.status = EnrollmentStatus.CONFIRMED;
            else enrollment.status = EnrollmentStatus.UNPAID;
        }
        course.status = CourseStatus.ON_GOING;
        await this.courseRepository.save(course);
      }
    }
  }
}
