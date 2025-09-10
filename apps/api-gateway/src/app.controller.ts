import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterFcmTokenDto } from '@app/shared/dtos/notifications/register-fcm-token.dto';
import { AuthGuard } from './guards/auth.guard';
import { I18nResponseInterceptor } from './interceptors/i18-response.interceptor';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreatePaymentLinkRequestDto } from '@app/shared/dtos/payments/create-payment-link.dto';
import { FileSizeLimitEnum } from '@app/shared/enums/file.enum';
import { UploadVideoDto } from '@app/shared/dtos/videos/video.dto';

@Controller()
@UseInterceptors(I18nResponseInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  //#region Notifications

  @Post('notifications/register-fcm-token')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Notifications'],
    summary: 'Register FCM Token',
    description:
      'Register a Firebase Cloud Messaging (FCM) token for push notifications',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'FCM token registered successfully',
  })
  async registerFcmToken(
    @Body()
    data: RegisterFcmTokenDto,
  ) {
    return this.appService.registerFcmToken(data);
  }

  //#endregion Notifications

  //#region Payments

  @Post('payment/create-link')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Payment'],
    summary: 'Create Payment Link',
    description: 'Create a new payment link',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment link created successfully',
  })
  async createPaymentLink(
    @Body()
    data: CreatePaymentLinkRequestDto,
  ) {
    return this.appService.createPaymentLink(data);
  }

  //#endregion Payments

  //#region Chats

  //#endregion

  //#region Video
}
