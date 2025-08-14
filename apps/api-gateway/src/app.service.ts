import { User } from '@app/database/entities/user.entity';
import { GoogleUserDto } from '@app/shared/dtos/auth/google-user.dto';
import { LoginRequestDto } from '@app/shared/dtos/auth/login.request.dto';
import { LoginResponseDto } from '@app/shared/dtos/auth/login.response.dto';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.request.dto';
import { RegisterFcmTokenDto } from '@app/shared/dtos/notifications/register-fcm-token.dto';
import { PaginatedResource } from '@app/shared/dtos/paginated-resource.dto';
import { CreateUserDto } from '@app/shared/dtos/users/create-user.dto';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { SendNotification } from '@app/shared/interfaces/send-notification.interface';
import { CustomApiRequest } from '@app/shared/requests/custom-api.request';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, map } from 'rxjs';

@Injectable({ scope: Scope.REQUEST })
export class AppService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationService: ClientProxy,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  //#region Authentication

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

  //#endregion

  //#region Users

  async createUser(data: CreateUserDto) {
    const pattern = { cmd: 'createUser' };
    const payload = data;

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async findAllUsers(
    findOptions: FindOptions,
  ): Promise<PaginatedResource<Partial<User>>> {
    console.log('Fetching all users from cache or service');
    const pattern = { cmd: 'findAllUsers' };

    const response = await lastValueFrom(
      this.userService.send<PaginatedResource<Partial<User>>>(
        pattern,
        findOptions,
      ),
    );

    return response;
  }

  async findUserById(id: number): Promise<User> {
    const pattern = { cmd: 'findUserById' };
    const payload = id;

    const response = await lastValueFrom(
      this.userService.send<User>(pattern, payload),
    );
    return response;
  }

  async updateMyAvatar(id: number, file: Express.Multer.File) {
    const pattern = { cmd: 'updateMyAvatar' };
    const payload = { id, file };

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async softDeleteUser(id: number) {
    const pattern = { cmd: 'softDeleteUser' };
    const payload = id;

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async deleteUser(id: number) {
    const pattern = { cmd: 'deleteUser' };
    const payload = id;

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async restoreUser(id: number) {
    const pattern = { cmd: 'restoreUser' };
    const payload = id;

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  //#endregion

  //#region Notifications

  async registerFcmToken(data: RegisterFcmTokenDto) {
    const pattern = { cmd: 'register_fcm_token' };

    const userId = this.request.user.id;
    const payload = { userId, ...data };

    const response = await lastValueFrom(
      this.notificationService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  //#endregion Notifications
}
