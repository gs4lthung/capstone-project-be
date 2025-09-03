import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.dto';
import {
  LoginRequestDto,
  LoginResponseDto,
} from '@app/shared/dtos/auth/login.dto';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RegisterFcmTokenDto } from '@app/shared/dtos/notifications/register-fcm-token.dto';
import { AuthGuard } from './guards/auth.guard';
import { GoogleOAuthGuard } from './guards/google-auth.guard';
import { GoogleUserDto } from '@app/shared/dtos/auth/google-user.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { Response } from 'express';
import { RefreshNewAccessTokenDto } from '@app/shared/dtos/auth/refresh-new-access-token.dto';
import { I18nResponseInterceptor } from './interceptors/i18-response.interceptor';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { CreatePaymentLinkRequestDto } from '@app/shared/dtos/payments/create-payment-link.dto';
import { ResetPasswordDto } from '@app/shared/dtos/auth/reset-password.dto';
import {
  CreatePersonalChatDto,
  SendMessageDto,
} from '@app/shared/dtos/chats/chat.dto';
import { FileSizeLimitEnum } from '@app/shared/enums/file.enum';
import { UploadVideoDto } from '@app/shared/dtos/videos/video.dto';

@Controller()
@UseInterceptors(I18nResponseInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  //#region Authentication

  //#endregion Authentication

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

  @Post('videos')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'video_thumbnail', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: FileSizeLimitEnum.VIDEO,
        },
      },
    ),
  )
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Video'],
    summary: 'Upload Video',
    description: 'Upload a new video',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Video uploaded successfully',
  })
  async uploadVideo(
    @Body() data: UploadVideoDto,
    @UploadedFiles()
    files: {
      video: Express.Multer.File[];
      video_thumbnail: Express.Multer.File[];
    },
  ) {
    return this.appService.uploadVideo(data, files);
  }
}
