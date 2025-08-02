import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.request.dto';
import { LoginRequestDto } from '@app/shared/dtos/auth/login.request.dto';
import { LoginResponseDto } from '@app/shared/dtos/auth/login.response.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterFcmTokenDto } from '@app/shared/dtos/notifications/register-fcm-token.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Authentication'],
    summary: 'User Login',
    description: 'Authenticate user and return JWT access token and user info',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
    type: LoginResponseDto,
  })
  async login(@Body() data: LoginRequestDto) {
    return this.appService.login(data);
  }

  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    tags: ['Authentication'],
    summary: 'User Registration',
    description: 'Register a new user with full name, email, and password',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
  })
  async register(@Body() data: RegisterRequestDto) {
    return this.appService.register(data);
  }

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
}
