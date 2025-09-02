import { Order } from '@app/database/entities/order.entity';
import { User } from '@app/database/entities/user.entity';
import { GoogleUserDto } from '@app/shared/dtos/auth/google-user.dto';
import {
  LoginRequestDto,
  LoginResponseDto,
} from '@app/shared/dtos/auth/login.dto';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.dto';
import { ResetPasswordDto } from '@app/shared/dtos/auth/reset-password.dto';
import {
  CreatePersonalChatDto,
  SendMessageDto,
} from '@app/shared/dtos/chats/chat.dto';
import { RegisterFcmTokenDto } from '@app/shared/dtos/notifications/register-fcm-token.dto';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';
import { CreatePaymentLinkRequestDto } from '@app/shared/dtos/payments/create-payment-link.dto';
import { CreateUserDto } from '@app/shared/dtos/users/create-user.dto';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { CheckoutResponseDataType } from '@payos/node/lib/type';
import { lastValueFrom, map } from 'rxjs';
import { UploadVideoDto } from '@app/shared/dtos/videos/video.dto';
import { Chat } from '@app/database/entities/chat.entity';

@Injectable({ scope: Scope.REQUEST })
export class AppService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationService: ClientProxy,
    @Inject('PAYMENT_SERVICE')
    private readonly paymentService: ClientProxy,
    @Inject('ORDER_SERVICE') private readonly orderService: ClientProxy,
    @Inject('CHAT_SERVICE') private readonly chatService: ClientProxy,
    @Inject('VIDEO_SERVICE') private readonly videoService: ClientProxy,
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
    const pattern = { cmd: 'login_with_google' };
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
    const pattern = { cmd: 'verify_email' };
    const payload = data;

    const response = await lastValueFrom(
      this.authService.send<string>(pattern, payload),
    );
    return response;
  }
  async refreshNewAccessToken(data: { refreshToken: string }) {
    const pattern = { cmd: 'refresh_new_access_token' };
    const payload = data;

    const response = await lastValueFrom(
      this.authService.send<CustomApiResponse<LoginResponseDto>>(
        pattern,
        payload,
      ),
    );
    return response;
  }

  async requestResetPassword(data: { email: string }) {
    const pattern = { cmd: 'request_reset_password' };
    const payload = data;

    const response = await lastValueFrom(
      this.authService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async resetPassword(
    data: ResetPasswordDto,
  ): Promise<CustomApiResponse<void>> {
    const pattern = { cmd: 'reset_password' };
    const payload = data;

    const response = await lastValueFrom(
      this.authService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  //#endregion

  //#region Users

  async createUser(data: CreateUserDto) {
    const pattern = { cmd: 'create_user' };
    const payload = data;

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async findAllUsers(
    findOptions: FindOptions,
  ): Promise<PaginatedResource<Partial<User>>> {
    const pattern = { cmd: 'find_all_users' };

    const response = await lastValueFrom(
      this.userService.send<PaginatedResource<Partial<User>>>(
        pattern,
        findOptions,
      ),
    );

    return response;
  }

  async findUserById(id: number): Promise<User> {
    const pattern = { cmd: 'find_user_by_id' };
    const payload = id;

    const response = await lastValueFrom(
      this.userService.send<User>(pattern, payload),
    );
    return response;
  }

  async updateMyAvatar(file: Express.Multer.File) {
    const pattern = { cmd: 'update_my_avatar' };
    const payload = { id: this.request.user.id, file };

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async softDeleteUser(id: number) {
    const pattern = { cmd: 'soft_delete_user' };
    const payload = id;

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async deleteUser(id: number) {
    const pattern = { cmd: 'delete_user' };
    const payload = id;

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async restoreUser(id: number) {
    const pattern = { cmd: 'restore_user' };
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
    const payload = { userId: this.request.user.id, ...data };

    const response = await lastValueFrom(
      this.notificationService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  //#endregion Notifications

  //#region Payment

  async createPaymentLink(data: CreatePaymentLinkRequestDto) {
    const pattern = { cmd: 'create_payment_link' };
    const payload = { userId: this.request.user.id, data: data };

    const response = await lastValueFrom(
      this.paymentService.send<CustomApiResponse<CheckoutResponseDataType>>(
        pattern,
        payload,
      ),
    );
    return response;
  }

  //#endregion Payment

  //#region Orders

  async findUserOrders(userId: number): Promise<Order[]> {
    const pattern = { cmd: 'find_user_orders' };
    const payload = { userId };

    const response = await lastValueFrom(
      this.orderService.send<Order[]>(pattern, payload),
    );
    return response;
  }

  //#endregion Orders

  //#region Chats

  async createPersonalChat(data: CreatePersonalChatDto) {
    const pattern = { cmd: 'create_personal_chat' };
    const payload = {
      ...data,
      createdBy: this.request.user.id,
    } as CreatePersonalChatDto;

    const response = await lastValueFrom(
      this.chatService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async sendMessage(
    data: SendMessageDto,
    files: {
      chat_image?: Express.Multer.File[];
      chat_video?: Express.Multer.File[];
    },
  ) {
    const pattern = { cmd: 'send_message' };
    const payload = {
      userId: this.request.user.id,
      data,
      files,
    };

    const response = await lastValueFrom(
      this.chatService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async findUserChats(userId: number): Promise<Chat[]> {
    const pattern = { cmd: 'find_user_chats' };
    const payload = { userId };

    const response = await lastValueFrom(
      this.chatService.send<Chat[]>(pattern, payload),
    );
    return response;
  }

  //#endregion Chats

  //#region Videos

  async uploadVideo(
    data: UploadVideoDto,
    files: {
      video: Express.Multer.File[];
      video_thumbnail: Express.Multer.File[];
    },
  ) {
    const pattern = { cmd: 'upload_video' };
    const payload = { userId: this.request.user.id, data, files };

    const response = await lastValueFrom(
      this.videoService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }
}
