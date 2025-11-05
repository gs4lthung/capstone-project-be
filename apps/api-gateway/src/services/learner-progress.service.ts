import { LearnerProgress } from '@app/database/entities/learner-progress.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { UserRole } from '@app/shared/enums/user.enum';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class LearnerProgressService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(LearnerProgress)
    private readonly learnerProgressRepository: Repository<LearnerProgress>,
  ) {}

  async getProgressForCourse(
    courseId: number,
  ): Promise<CustomApiResponse<LearnerProgress[]>> {
    let progresses: LearnerProgress[] = [];

    const user = this.request.user as User;
    if (!user) throw new BadRequestException('User not found');

    switch (user.role.name) {
      case UserRole.LEARNER:
        progresses = await this.learnerProgressRepository.find({
          where: {
            course: { id: courseId },
            user: user,
          },
        });
        break;
      case UserRole.COACH:
        progresses = await this.learnerProgressRepository.find({
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
  }
}
