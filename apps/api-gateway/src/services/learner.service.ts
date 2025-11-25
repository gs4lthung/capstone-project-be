import { AiVideoComparisonResult } from '@app/database/entities/ai-video-comparison-result.entity';
import { Course } from '@app/database/entities/course.entity';
import { LearnerProgress } from '@app/database/entities/learner-progress.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { EnrollmentStatus } from '@app/shared/enums/enrollment.enum';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DataSource } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class LearnerService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    private readonly datasource: DataSource,
  ) {}

  async getTotalCourses(): Promise<number> {
    return await this.datasource.transaction(async (manager) => {
      const total = await manager
        .getRepository(Course)
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.enrollments', 'enrollments')
        .leftJoinAndSelect('enrollments.user', 'user')
        .where('enrollments.user.id = :learnerId', {
          learnerId: this.request.user.id,
        })
        .andWhere('enrollments.status IN (:...statuses)', {
          statuses: [
            EnrollmentStatus.CONFIRMED,
            EnrollmentStatus.DONE,
            EnrollmentStatus.LEARNING,
            EnrollmentStatus.PENDING_GROUP,
          ],
        })
        .getCount();
      return total;
    });
  }

  async getTotalAiFeedbacks(): Promise<number> {
    return await this.datasource.transaction(async (manager) => {
      const total = await manager
        .getRepository(AiVideoComparisonResult)
        .createQueryBuilder('aiVideoComparisonResult')
        .leftJoinAndSelect(
          'aiVideoComparisonResult.learnerVideo',
          'learnerVideo',
        )
        .leftJoinAndSelect('learnerVideo.user', 'user')
        .where('user.id = :learnerId', {
          learnerId: this.request.user.id,
        })
        .getCount();
      return total;
    });
  }

  async getCurrentLearnerProgresses() {
    return await this.datasource.transaction(async (manager) => {
      const learnerProgresses = await manager
        .getRepository(LearnerProgress)
        .createQueryBuilder('learnerProgress')
        .leftJoinAndSelect('learnerProgress.user', 'user')
        .leftJoinAndSelect('learnerProgress.course', 'course')
        .where('user.id = :learnerId', {
          learnerId: this.request.user.id,
        })
        .andWhere('course.status IN (:...statuses)', {
          statuses: [CourseStatus.ON_GOING],
        })
        .getMany();
      return learnerProgresses;
    });
  }
}
