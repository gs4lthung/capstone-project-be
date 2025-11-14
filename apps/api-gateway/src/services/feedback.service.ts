import { Course } from '@app/database/entities/course.entity';
import { Feedback } from '@app/database/entities/feedback.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  CreateFeedbackDto,
  UpdateFeedbackDto,
} from '@app/shared/dtos/feedbacks/feedback.dto';
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
        relations: ['createdBy', 'enrollments'],
      });
      if (!course)
        throw new BadRequestException(
          'Invalid course ID or course not completed',
        );

      const isEnrolledToCourse = course.enrollments.some(
        (enrollment) => enrollment.user.id === (this.request.user as User).id,
      );
      if (!isEnrolledToCourse)
        throw new BadRequestException(
          'You must be enrolled in the course to provide feedback',
        );

      const isAlreadySubmitted = await this.feedbackRepository.findOne({
        where: {
          course: { id: courseId },
          createdBy: { id: (this.request.user as User).id },
        },
      });
      if (isAlreadySubmitted)
        throw new BadRequestException(
          'You have already submitted feedback for this course',
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

  async update(
    id: number,
    data: UpdateFeedbackDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const feedback = await this.feedbackRepository.findOne({
        where: { id: id, createdBy: { id: (this.request.user as User).id } },
      });
      if (!feedback)
        throw new BadRequestException('Feedback not found or access denied');

      manager.getRepository(Feedback).update(feedback.id, data);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Feedback updated successfully',
      );
    });
  }

  async findByCourseId(courseId: number): Promise<Feedback[]> {
    const feedbacks = await this.feedbackRepository.find({
      where: { course: { id: courseId } },
      relations: ['createdBy', 'course', 'receivedBy'],
      order: {
        createdAt: 'DESC',
      },
    });

    return feedbacks;
  }

  async findForCoach(): Promise<CustomApiResponse<Feedback[]>> {
    const feedbacks = await this.feedbackRepository.find({
      where: { receivedBy: { id: this.request.user.id as User['id'] } },
      relations: ['createdBy', 'receivedBy'],
      order: {
        createdAt: 'DESC',
      },
    });
    return new CustomApiResponse<Feedback[]>(
      HttpStatus.OK,
      'Feedbacks retrieved successfully',
      feedbacks,
    );
  }
}
