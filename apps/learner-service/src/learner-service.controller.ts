import { Controller } from '@nestjs/common';
import { LearnerServiceService } from './learner-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { LearnerMsgPattern } from '@app/shared/msg_patterns/learner.msg_pattern';
import { CreateLearnerProfileDto } from '@app/shared/dtos/users/learners/learner.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';

@Controller()
export class LearnerServiceController {
  constructor(private readonly learnerServiceService: LearnerServiceService) {}

  @MessagePattern({ cmd: LearnerMsgPattern.CREATE_LEARNER_PROFILE })
  createLearnerProfile(payload: {
    userId: number;
    data: CreateLearnerProfileDto;
  }): Promise<CustomApiResponse<void>> {
    return this.learnerServiceService.createLearnerProfile(
      payload.userId,
      payload.data,
    );
  }
}
