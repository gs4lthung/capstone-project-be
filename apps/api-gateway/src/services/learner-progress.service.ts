import { LearnerProgress } from '@app/database/entities/learner-progress.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { UserRole } from '@app/shared/enums/user.enum';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
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
    courseId: number,
  ): Promise<CustomApiResponse<LearnerProgress[]>> {
    return await this.datasource.transaction(async (manager) => {
      let progresses: LearnerProgress[] = [];

      const user = this.request.user as User;
      if (!user) throw new BadRequestException('User not found');

      switch (user.role.name) {
        case UserRole.LEARNER:
          progresses = await manager.getRepository(LearnerProgress).find({
            where: {
              course: { id: courseId },
              user: user,
            },
          });
          break;
        case UserRole.COACH:
          progresses = await manager.getRepository(LearnerProgress).find({
            where: {
              course: { id: courseId },
            },
          });
          break;
      }

      return new CustomApiResponse<LearnerProgress[]>(
        HttpStatus.OK,
        'Learner progresses retrieved successfully',
        progresses,
      );
    });
  }
}
