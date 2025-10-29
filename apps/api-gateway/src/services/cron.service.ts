import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Course } from '@app/database/entities/course.entity';
import {
  CourseStatus,
  CourseLearningFormat,
} from '@app/shared/enums/course.enum';
import { Enrollment } from '@app/database/entities/enrollment.entity';
import { In } from 'typeorm';
import { EnrollmentStatus } from '@app/shared/enums/enrollment.enum';
import { PaymentStatus } from '@app/shared/enums/payment.enum';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
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
    const now = new Date();
    for (const course of courses) {
      // If the course start date is in the past or today, start it
      if (!course.startDate) continue;
      const startDate = new Date(course.startDate);
      if (startDate > now) continue;

      this.logger.log(
        `Processing start for course ${course.id} (startDate=${startDate.toISOString()})`,
      );

      // Ensure enrollments are loaded with payments
      await this.courseRepository.manager
        .createQueryBuilder()
        .relation(Course, 'enrollments')
        .of(course)
        .loadMany();
      // Reload enrollments with payments relation
      const courseWithEnrollments = await this.courseRepository.findOne({
        where: { id: course.id },
        relations: ['enrollments', 'enrollments.payments'],
        withDeleted: false,
      });
      if (!courseWithEnrollments) continue;

      const enrollments = courseWithEnrollments.enrollments || [];

      if (course.learningFormat === CourseLearningFormat.INDIVIDUAL) {
        // For individual courses, confirm any enrollment with a PAID payment and start the course
        for (const e of enrollments) {
          const hasPaid = (e.payments || []).some(
            (p) => p.status === PaymentStatus.PAID,
          );
          if (hasPaid && e.status !== EnrollmentStatus.CONFIRMED) {
            e.status = EnrollmentStatus.CONFIRMED;
            await this.enrollmentRepository.save(e);
          }
        }

        course.status = CourseStatus.ON_GOING;
        await this.courseRepository.save(course);
        this.logger.log(`Started individual course ${course.id}`);
        continue;
      }

      // GROUP course logic
      const paidEnrollments = enrollments.filter((e) =>
        (e.payments || []).some((p) => p.status === PaymentStatus.PAID),
      );
      const paidCount = paidEnrollments.length;

      if (paidCount >= course.minParticipants) {
        // Confirm only those who have paid
        for (const e of paidEnrollments) {
          if (e.status !== EnrollmentStatus.CONFIRMED) {
            e.status = EnrollmentStatus.CONFIRMED;
            await this.enrollmentRepository.save(e);
          }
        }

        // Mark others (pending group) as UNPAID so they're not considered confirmed
        for (const e of enrollments) {
          if (
            e.status === EnrollmentStatus.PENDING_GROUP &&
            !(e.payments || []).some((p) => p.status === PaymentStatus.PAID)
          ) {
            e.status = EnrollmentStatus.UNPAID;
            await this.enrollmentRepository.save(e);
          }
        }

        // Update course status to ongoing
        course.status = CourseStatus.ON_GOING;
        await this.courseRepository.save(course);
        this.logger.log(
          `Course ${course.id} started with ${paidCount} paid enrollments`,
        );
      } else {
        // Not enough paid learners: cancel course and mark affected enrollments as REFUNDED
        course.status = CourseStatus.CANCELLED;
        await this.courseRepository.save(course);

        for (const e of enrollments) {
          if (
            [
              EnrollmentStatus.PENDING_GROUP,
              EnrollmentStatus.CONFIRMED,
            ].includes(e.status)
          ) {
            e.status = EnrollmentStatus.REFUNDED;
            await this.enrollmentRepository.save(e);
          }
        }

        this.logger.log(
          `Course ${course.id} cancelled due to insufficient paid enrollments (${paidCount}/${course.minParticipants})`,
        );
      }
    }
  }
}
