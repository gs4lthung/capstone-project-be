import { Controller } from '@nestjs/common';
import { CoachServiceService } from './coach-service.service';
import { MessagePattern } from '@nestjs/microservices';
import {
  CreateCoachPackageDto,
  CreateCoachProfileDto,
  UpdateCoachProfileDto,
  VerifyCoachProfileDto,
} from '@app/shared/dtos/users/coaches/coach.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CoachMsgPattern } from '@app/shared/msg_patterns/coach_msg_pattern';

@Controller()
export class CoachServiceController {
  constructor(private readonly coachServiceService: CoachServiceService) {}

  @MessagePattern({ cmd: CoachMsgPattern.CREATE_COACH_PROFILE })
  async createCoachProfile(payload: {
    userId: number;
    data: CreateCoachProfileDto;
  }): Promise<CustomApiResponse<void>> {
    return this.coachServiceService.createCoachProfile(
      payload.userId,
      payload.data,
    );
  }

  @MessagePattern({ cmd: CoachMsgPattern.UPDATE_COACH_PROFILE })
  async updateCoachProfile(payload: {
    userId: number;
    data: UpdateCoachProfileDto;
  }): Promise<CustomApiResponse<void>> {
    return this.coachServiceService.updateCoachProfile(
      payload.userId,
      payload.data,
    );
  }

  @MessagePattern({ cmd: CoachMsgPattern.VERIFY_COACH_PROFILE })
  async verifyCoachProfile(payload: {
    adminId: number;
    data: VerifyCoachProfileDto;
  }): Promise<CustomApiResponse<void>> {
    return this.coachServiceService.verifyCoachProfile(
      payload.adminId,
      payload.data,
    );
  }

  @MessagePattern({ cmd: CoachMsgPattern.CREATE_COACH_PACKAGE })
  async createCoachPackage(payload: {
    userId: number;
    data: CreateCoachPackageDto;
  }): Promise<CustomApiResponse<void>> {
    return this.coachServiceService.createCoachPackage(
      payload.userId,
      payload.data,
    );
  }
}
