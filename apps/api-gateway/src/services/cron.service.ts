import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Course } from '@app/database/entities/course.entity';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { Enrollment } from '@app/database/entities/enrollment.entity';
import { In } from 'typeorm';
import { EnrollmentStatus } from '@app/shared/enums/enrollment.enum';
import { LearnerProgress } from '@app/database/entities/learner-progress.entity';
import { LearnerProgressStatus } from '@app/shared/enums/learner.enum';
import { Configuration } from '@app/database/entities/configuration.entity';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(LearnerProgress)
    private readonly learnerProgressRepository: Repository<LearnerProgress>,
    @InjectRepository(Configuration)
    private readonly configurationRepository: Repository<Configuration>,
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
    let checkCourseBeforeDays = await this.configurationRepository.findOne({
      where: { key: 'course_start_before_days' },
    });
    if (!checkCourseBeforeDays) {
      this.logger.error(
        "Configuration 'course_start_before_days' not found. Create a default value of 1.",
      );
      checkCourseBeforeDays = this.configurationRepository.create({
        key: 'course_start_before_days',
        value: '1',
        dataType: 'number',
        description:
          'Number of days before course start to trigger the start process',
      });
      await this.configurationRepository.save(checkCourseBeforeDays);
    }

    for (const course of courses) {
      if (
        new Date(course.startDate).getTime() +
          Number(checkCourseBeforeDays.value) * 24 * 60 * 60 * 1000 >=
        Date.now()
      ) {
        this.logger.log(`Start course ${course.id}`);
        let courseTotalEarnings = 0;
        course.status = CourseStatus.ON_GOING;
        for (const enrollment of course.enrollments) {
          enrollment.status = EnrollmentStatus.LEARNING;
          await this.enrollmentRepository.save(enrollment);

          const learnerProgress = this.learnerProgressRepository.create({
            totalSessions: course.totalSessions,
            status: LearnerProgressStatus.IN_PROGRESS,
            course: course,
            user: enrollment.user,
          });
          await this.learnerProgressRepository.save(learnerProgress);

          courseTotalEarnings += enrollment.paymentAmount;
        }
        course.totalEarnings = courseTotalEarnings;
        await this.courseRepository.save(course);
      }
    }
  }
}
