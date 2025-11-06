import { Course } from '@app/database/entities/course.entity';
import { Feedback } from '@app/database/entities/feedback.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CreateFeedbackDto } from '@app/shared/dtos/feedbacks/feedback.dto';
import { CourseStatus } from '@app/shared/enums/course.enum';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NotificationService } from './notification.service';
import { NotificationType } from '@app/shared/enums/notification.enum';

@Injectable({ scope: Scope.REQUEST })
export class FeedbackService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly notificationService: NotificationService,
    private readonly datasource: DataSource,
  ) {}

  async create(
    courseId: number,
    data: CreateFeedbackDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const course = await this.courseRepository.findOne({
        where: { id: courseId, status: CourseStatus.COMPLETED },
        relations: ['createdBy'],
      });
      if (!course)
        throw new BadRequestException(
          'Invalid course ID or course not completed',
        );

      const feedback = this.feedbackRepository.create({
        comment: data.comment,
        rating: data.rating,
        isAnonymous: data.isAnonymous || false,
        course: course,
        createdBy: this.request.user as User,
        receivedBy: course.createdBy as User,
      });
      await manager.getRepository(Feedback).save(feedback);

      await this.notificationService.sendNotification({
        userId: course.createdBy.id,
        title: 'Feedback mới nhận được',
        body: `Khóa học ${course.name} vừa nhận được một phản hồi mới.`,
        navigateTo: `/coach/courses/${course.id}/feedbacks`,
        type: NotificationType.INFO,
      });

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'Feedback submitted successfully',
      );
    });
  }
}
