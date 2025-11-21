import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Course } from '@app/database/entities/course.entity';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { Enrollment } from '@app/database/entities/enrollment.entity';
import { In } from 'typeorm';
import { EnrollmentStatus } from '@app/shared/enums/enrollment.enum';
import { LearnerProgress } from '@app/database/entities/learner-progress.entity';
import { LearnerProgressStatus } from '@app/shared/enums/learner.enum';
import { Configuration } from '@app/database/entities/configuration.entity';
import { NotificationService } from './notification.service';
import { NotificationType } from '@app/shared/enums/notification.enum';
import { CreateConfigurationDto } from '@app/shared/dtos/configurations/configuration.dto';
import { Payment } from '@app/database/entities/payment.entity';
import {
  PaymentStatus,
  WalletTransactionType,
} from '@app/shared/enums/payment.enum';
import { Wallet } from '@app/database/entities/wallet.entity';
import { WalletTransaction } from '@app/database/entities/wallet-transaction.entity';
import { SessionStatus } from '@app/shared/enums/session.enum';
import { Session } from '@app/database/entities/session.entity';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    private readonly notificationService: NotificationService,
    private readonly datasource: DataSource,
  ) {}

  private readonly logger = new Logger(CronService.name);

  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleStartCourse() {
    return this.datasource.transaction(async (manager) => {
      this.logger.log('Check for courses to start');
      const courses = await manager.getRepository(Course).find({
        where: { status: In([CourseStatus.FULL, CourseStatus.READY_OPENED]) },
        withDeleted: false,
        relations: ['enrollments', 'createdBy', 'sessions'],
      });

      const checkCourseBeforeDays = await this.checkExistAndCreateDefaultConfig(
        {
          key: 'course_start_before_days',
          value: '1',
          dataType: 'number',
          description:
            'Number of days before course start to trigger the start process',
        },
      );

      for (const course of courses) {
        if (
          new Date(course.startDate).getTime() -
            Number(checkCourseBeforeDays.value) * 24 * 60 * 60 * 1000 <=
          Date.now()
        ) {
          this.logger.log(`Start course ${course.id}`);
          course.status = CourseStatus.ON_GOING;
          for (const enrollment of course.enrollments) {
            enrollment.status = EnrollmentStatus.LEARNING;
            await manager.getRepository(Enrollment).save(enrollment);

            const learnerProgress = manager
              .getRepository(LearnerProgress)
              .create({
                totalSessions: course.totalSessions,
                status: LearnerProgressStatus.IN_PROGRESS,
                course: course,
                user: enrollment.user,
              });
            await manager.getRepository(LearnerProgress).save(learnerProgress);

            await this.notificationService.sendNotification({
              userId: enrollment.user.id,
              title: 'Khởi động khóa học',
              body: `Khóa học ${course.name} đã bắt đầu.`,
              navigateTo: `/coach/courses/${course.id}`,
              type: NotificationType.INFO,
            });
          }
          await manager.getRepository(Course).save(course);

          for (const session of course.sessions) {
            session.status = SessionStatus.SCHEDULED;
            await manager.getRepository(Session).save(session);
          }

          await this.notificationService.sendNotification({
            userId: course.createdBy.id,
            title: 'Khóa học đã bắt đầu',
            body: `Khóa học ${course.name} của bạn đã chính thức bắt đầu.`,
            navigateTo: `/coach/courses/${course.id}`,
            type: NotificationType.INFO,
          });
        }
      }
    });
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleCancelCourse() {
    return this.datasource.transaction(async (manager) => {
      this.logger.log('Check for course to cancel');
      const courses = await this.courseRepository.find({
        where: {
          status: In([
            CourseStatus.PENDING_APPROVAL,
            CourseStatus.APPROVED,
            CourseStatus.REJECTED,
          ]),
        },
        withDeleted: false,
        relations: ['createdBy', 'enrollments', 'enrollments.user', 'sessions'],
      });

      const checkCourseBeforeDays = await this.checkExistAndCreateDefaultConfig(
        {
          key: 'course_start_before_days',
          value: '1',
          dataType: 'number',
          description:
            'Number of days before course start to trigger the start process',
        },
      );

      for (const course of courses) {
        if (
          new Date(course.startDate).getTime() -
            Number(checkCourseBeforeDays.value) * 24 * 60 * 60 * 1000 <=
          Date.now()
        ) {
          this.logger.log(`Cancel course ${course.id}`);

          let cancellingReason: string;
          switch (course.status) {
            case CourseStatus.PENDING_APPROVAL:
              cancellingReason = 'Khóa học chưa được phê duyệt kịp thời.';
              break;
            case CourseStatus.APPROVED:
              cancellingReason = 'Khóa học không đủ học viên để bắt đầu.';
              break;
            case CourseStatus.REJECTED:
              cancellingReason = 'Khóa học bị từ chối phê duyệt.';
              break;
          }

          for (const session of course.sessions) {
            session.status = SessionStatus.CANCELLED;
            await manager.getRepository(Session).save(session);
          }

          course.status = CourseStatus.CANCELLED;
          course.cancellingReason = cancellingReason;
          course.totalEarnings = 0;
          await manager.getRepository(Course).save(course);

          for (const enrollment of course.enrollments) {
            enrollment.status = EnrollmentStatus.CANCELLED;

            const payment = await manager.getRepository(Payment).findOne({
              where: {
                enrollment: { id: enrollment.id },
                status: PaymentStatus.PAID,
              },
            });
            if (payment) {
              const wallet = await manager.getRepository(Wallet).findOne({
                where: {
                  user: { id: enrollment.user.id },
                },
                withDeleted: false,
              });
              if (wallet) {
                wallet.currentBalance =
                  Number(wallet.currentBalance) + Number(payment.amount);
                await manager.getRepository(Wallet).save(wallet);

                const walletTransaction =
                  this.walletTransactionRepository.create({
                    wallet: wallet,
                    amount: payment.amount,
                    type: WalletTransactionType.CREDIT,
                    description: `Hoàn tiền khóa học ${course.name} bị hủy`,
                  });
                await manager
                  .getRepository(WalletTransaction)
                  .save(walletTransaction);
              }
            }
          }
        }
      }
    });
  }

  async checkExistAndCreateDefaultConfig(
    data: CreateConfigurationDto,
  ): Promise<Configuration> {
    return await this.datasource.transaction(async (manager) => {
      let config = await manager.getRepository(Configuration).findOne({
        where: { key: data.key },
      });
      if (!config) {
        config = manager.getRepository(Configuration).create({
          key: data.key,
          value: data.value,
          dataType: data.dataType,
          description: data.description,
        });
        await manager.getRepository(Configuration).save(config);
      }
      return config;
    });
  }
}
