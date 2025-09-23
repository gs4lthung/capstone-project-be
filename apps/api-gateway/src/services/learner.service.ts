import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CreateLearnerProfileDto } from '@app/shared/dtos/users/learners/learner.dto';
import { LearnerMsgPattern } from '@app/shared/msg_patterns/learner.msg_pattern';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable({ scope: Scope.REQUEST })
export class LearnerService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @Inject('LEARNER_SERVICE') private readonly learnerService: ClientProxy,
  ) {}

  async createLearnerProfile(data: CreateLearnerProfileDto) {
    const pattern = { cmd: LearnerMsgPattern.CREATE_LEARNER_PROFILE };
    const payload = { userId: this.request.user.id, data };
    const response = await lastValueFrom(
      this.learnerService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }
}
