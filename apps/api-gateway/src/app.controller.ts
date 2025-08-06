import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.request.dto';
import { LoginRequestDto } from '@app/shared/dtos/auth/login.request.dto';
import { LoginResponseDto } from '@app/shared/dtos/auth/login.response.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterFcmTokenDto } from '@app/shared/dtos/notifications/register-fcm-token.dto';
import { AuthGuard } from './guards/auth.guard';
import { GoogleOAuthGuard } from './guards/google-auth.guard';
import { GoogleUserDto } from '@app/shared/dtos/auth/google-user.dto';

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

  @Get('auth/verify-email')
  @ApiOperation({
    tags: ['Authentication'],
    summary: 'Email Verification',
    description:
      'Verify user email using the token sent during registration. Redirects to the client application upon success.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email successfully verified',
    type: String,
  })
  async verifyEmail(@Request() req, @Response() res) {
    const token = req.query.token as string;
    const redirectUrl = await this.appService.verifyEmail({ token });
    return res.redirect(redirectUrl);
  }

  @Get('auth/google')
  @UseGuards(GoogleOAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Request() req) {}

  @Get('auth/google-redirect')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    tags: ['Authentication'],
    summary: 'Google OAuth Redirect',
    description:
      'Redirect endpoint for Google OAuth, handles user authentication and registration',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'User successfully authenticated with Google, navigate to the client application',
    type: String,
  })
  async googleAuthRedirect(@Request() req, @Response() res) {
    const user: GoogleUserDto = req.user;
    const redirectUrl = await this.appService.loginWithGoogle(user);
    return res.redirect(redirectUrl);
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
