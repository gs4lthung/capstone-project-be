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

@Injectable({ scope: Scope.REQUEST })
export class FeedbackService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
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

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'Feedback submitted successfully',
      );
    });
  }
}
