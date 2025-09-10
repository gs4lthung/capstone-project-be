import { Order } from '@app/database/entities/order.entity';
import { RegisterFcmTokenDto } from '@app/shared/dtos/notifications/register-fcm-token.dto';
import { CreatePaymentLinkRequestDto } from '@app/shared/dtos/payments/create-payment-link.dto';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { CheckoutResponseDataType } from '@payos/node/lib/type';
import { lastValueFrom } from 'rxjs';

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

  //#endregion

  //#region Users

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

  //#endregion Chats

  //#region Videos
}
