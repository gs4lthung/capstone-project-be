import { LearnerProgress } from '@app/database/entities/learner-progress.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class LearnerProgressService extends BaseTypeOrmService<LearnerProgress> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(LearnerProgress)
    private readonly learnerProgressRepository: Repository<LearnerProgress>,
    private readonly datasource: DataSource,
  ) {
    super(learnerProgressRepository);
  }

  async findAll(
    findOptions: FindOptions,
  ): Promise<PaginateObject<LearnerProgress>> {
    return super.find(
      findOptions,
      'learnerProgress',
      PaginateObject<LearnerProgress>,
    );
  }

  async getProgressForCourse(
    courseStatus: CourseStatus,
  ): Promise<CustomApiResponse<LearnerProgress[]>> {
    return await this.datasource.transaction(async (manager) => {
      let progresses: LearnerProgress[] = [];
      progresses = await manager
        .getRepository(LearnerProgress)
        .createQueryBuilder('learnerProgress')
        .leftJoinAndSelect('learnerProgress.user', 'user')
        .leftJoinAndSelect('learnerProgress.course', 'course')
        .leftJoinAndSelect('course.createdBy', 'createdBy')
        .where('course.status = :courseStatus', { courseStatus })
        .andWhere('createdBy.id = :userId', { userId: this.request.user.id })
        .getMany();

      return new CustomApiResponse<LearnerProgress[]>(
        HttpStatus.OK,
        'Learner progresses retrieved successfully',
        progresses,
      );
    });
  }

  async getLearnerProgressDetails(
    userId: number,
    courseId: number,
  ): Promise<LearnerProgress> {
    return await this.datasource.transaction(async (manager) => {
      const progress = await manager
        .getRepository(LearnerProgress)
        .createQueryBuilder('learnerProgress')
        .leftJoinAndSelect('learnerProgress.user', 'user')
        .leftJoinAndSelect('learnerProgress.course', 'course')
        .leftJoinAndSelect('course.sessions', 'sessions')
        .leftJoinAndSelect('sessions.video', 'video')
        .leftJoinAndSelect('sessions.quiz', 'quiz')
        .leftJoinAndSelect('sessions.learnerVideos', 'learnerVideos')
        .leftJoinAndSelect('learnerVideos.user', 'learnerVideoUser')
        .andWhere('learnerVideoUser.id = :userId', { userId })
        .leftJoinAndSelect('quiz.questions', 'questions')
        .leftJoinAndSelect('questions.options', 'options')
        .leftJoinAndSelect('course.createdBy', 'createdBy')
        .where('user.id = :userId', { userId })
        .andWhere('course.id = :courseId', { courseId })
        .getOne();
      return progress;
    });
  }
}
