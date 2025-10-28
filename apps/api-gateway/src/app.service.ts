import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class AppService {
  constructor(@Inject(REQUEST) private readonly request: CustomApiRequest) {}
}
