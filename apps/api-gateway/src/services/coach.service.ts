import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  CreateCoachPackageDto,
  CreateCoachProfileCredentialDto,
  CreateCoachProfileDto,
  UpdateCoachProfileCredentialDto,
  UpdateCoachProfileDto,
  VerifyCoachProfileDto,
} from '@app/shared/dtos/users/coaches/coach.dto';
import { CoachMsgPattern } from '@app/shared/msg_patterns/coach_msg_pattern';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable({ scope: Scope.REQUEST })
export class CoachService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @Inject('COACH_SERVICE') private readonly coachService: ClientProxy,
  ) {}

  async createCoachProfile(data: CreateCoachProfileDto) {
    const pattern = { cmd: CoachMsgPattern.CREATE_COACH_PROFILE };
    const payload = { userId: this.request.user.id, data };
    const response = await lastValueFrom(
      this.coachService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async updateCoachProfile(data: UpdateCoachProfileDto) {
    const pattern = { cmd: CoachMsgPattern.UPDATE_COACH_PROFILE };
    const payload = { userId: this.request.user.id, data };
    const response = await lastValueFrom(
      this.coachService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async verifyCoachProfile(data: VerifyCoachProfileDto) {
    const pattern = { cmd: CoachMsgPattern.VERIFY_COACH_PROFILE };
    const payload = { adminId: this.request.user.id, data };
    const response = await lastValueFrom(
      this.coachService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async createCoachProfileCredential(
    file: Express.Multer.File,
    data: CreateCoachProfileCredentialDto,
  ) {
    const pattern = { cmd: CoachMsgPattern.CREATE_COACH_PROFILE_CREDENTIAL };
    const payload = { userId: this.request.user.id, data, file };
    const response = await lastValueFrom(
      this.coachService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async updateCoachProfileCredential(data: UpdateCoachProfileCredentialDto) {
    const pattern = { cmd: CoachMsgPattern.UPDATE_COACH_PROFILE_CREDENTIAL };
    const payload = { userId: this.request.user.id, data };
    const response = await lastValueFrom(
      this.coachService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async createCoachPackage(data: CreateCoachPackageDto) {
    const pattern = { cmd: CoachMsgPattern.CREATE_COACH_PACKAGE };
    const payload = { userId: this.request.user.id, data };
    const response = await lastValueFrom(
      this.coachService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }
}
