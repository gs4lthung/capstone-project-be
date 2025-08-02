import { ConfigService } from '@app/config';
import { User } from '@app/database/entities/user.entity';
import { LoginRequestDto } from '@app/shared/dtos/auth/login.request.dto';
import { LoginResponseDto } from '@app/shared/dtos/auth/login.response.dto';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.request.dto';
import { RegisterFcmTokenDto } from '@app/shared/dtos/notifications/register-fcm-token.dto';
import { CustomApiRequest } from '@app/shared/requests/custom-api.request';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { map } from 'rxjs';

@Injectable({ scope: Scope.REQUEST })
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationService: ClientProxy,
  ) {}

  login(data: LoginRequestDto) {
    const pattern = { cmd: 'login' };
    const payload = data;
    return this.authService
      .send<CustomApiResponse<LoginResponseDto>>(pattern, payload)
      .pipe(
        map((response) => {
          return response;
        }),
      );
  }

  register(data: RegisterRequestDto) {
    const pattern = { cmd: 'register' };
    const payload = data;
    return this.authService
      .send<CustomApiResponse<void>>(pattern, payload)
      .pipe(
        map((response) => {
          return response;
        }),
      );
  }

  findAllUsers() {
    const pattern = { cmd: 'findAllUsers' };
    return this.userService.send<User[]>(pattern, {}).pipe(
      map((response) => {
        return response;
      }),
    );
  }

  findUserById(id: number) {
    const pattern = { cmd: 'findUserById' };
    const payload = id;
    return this.userService.send<User>(pattern, payload).pipe(
      map((response) => {
        return response;
      }),
    );
  }

  registerFcmToken(data: RegisterFcmTokenDto) {
    const pattern = { cmd: 'registerFcmToken' };

    const userId = this.request.user.id;
    const payload = { userId, ...data };
    return this.notificationService
      .send<CustomApiResponse<void>>(pattern, payload)
      .pipe(
        map((response) => {
          return response;
        }),
      );
  }
}
