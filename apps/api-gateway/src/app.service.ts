import { ConfigService } from '@app/config';
import { User } from '@app/database/entities/user.entity';
import { RedisService } from '@app/redis';
import { GoogleUserDto } from '@app/shared/dtos/auth/google-user.dto';
import { LoginRequestDto } from '@app/shared/dtos/auth/login.request.dto';
import { LoginResponseDto } from '@app/shared/dtos/auth/login.response.dto';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.request.dto';
import { RegisterFcmTokenDto } from '@app/shared/dtos/notifications/register-fcm-token.dto';
import { CreateUserDto } from '@app/shared/dtos/users/create-user.dto';
import { CustomApiRequest } from '@app/shared/requests/custom-api.request';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, map } from 'rxjs';

@Injectable({ scope: Scope.REQUEST })
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationService: ClientProxy,
    private readonly redisService: RedisService,
  ) {}

  async login(data: LoginRequestDto) {
    const pattern = { cmd: 'login' };
    const payload = data;

    const response = await lastValueFrom(
      this.authService
        .send<CustomApiResponse<LoginResponseDto>>(pattern, payload)
        .pipe(
          map((response) => {
            return response;
          }),
        ),
    );
    return response;
  }

  async loginWithGoogle(data: GoogleUserDto) {
    const pattern = { cmd: 'loginWithGoogle' };
    const payload = data;

    const response = await lastValueFrom(
      this.authService.send<string>(pattern, payload).pipe(
        map((response) => {
          return response;
        }),
      ),
    );
    return response;
  }

  async register(data: RegisterRequestDto) {
    const pattern = { cmd: 'register' };
    const payload = data;

    const response = await lastValueFrom(
      this.authService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async verifyEmail(data: { token: string }) {
    const pattern = { cmd: 'verifyEmail' };
    const payload = data;

    const response = await lastValueFrom(
      this.authService.send<string>(pattern, payload),
    );
    return response;
  }
  async refreshNewAccessToken(data: { refreshToken: string }) {
    const pattern = { cmd: 'refreshNewAccessToken' };
    const payload = data;

    const response = await lastValueFrom(
      this.authService.send<CustomApiResponse<LoginResponseDto>>(
        pattern,
        payload,
      ),
    );
    return response;
  }

  async createUser(data: CreateUserDto) {
    const pattern = { cmd: 'createUser' };
    const payload = data;

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async findAllUsers() {
    console.log('Fetching all users from cache or service');
    const pattern = { cmd: 'findAllUsers' };

    const response = await lastValueFrom(
      this.userService.send<User[]>(pattern, {}),
    );

    return response;
  }

  async findUserById(id: number) {
    const pattern = { cmd: 'findUserById' };
    const payload = id;

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<User>>(pattern, payload),
    );
    return response;
  }

  async updateUserAvatar(id: number, file: Express.Multer.File) {
    const pattern = { cmd: 'updateUserAvatar' };
    const payload = { id, file };

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async registerFcmToken(data: RegisterFcmTokenDto) {
    const pattern = { cmd: 'register_fcm_token' };

    const userId = this.request.user.id;
    const payload = { userId, ...data };

    const response = await lastValueFrom(
      this.notificationService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }
}
