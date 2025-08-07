import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.request.dto';
import { LoginRequestDto } from '@app/shared/dtos/auth/login.request.dto';
import { LoginResponseDto } from '@app/shared/dtos/auth/login.response.dto';
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
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { Response } from 'express';
import { CustomApiRequest } from '@app/shared/requests/custom-api.request';
import { RefreshNewAccessTokenDto } from '@app/shared/dtos/auth/refresh-new-access-token.dto';

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
  async login(
    @Body() data: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CustomApiResponse<LoginResponseDto>> {
    const result = await this.appService.login(data);

    res.cookie('refreshToken', result.metadata.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    delete result.metadata.refreshToken;
    return result;
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
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    const redirectUrl = await this.appService.verifyEmail({ token });
    return res.redirect(redirectUrl);
  }

  @Get('auth/google')
  @UseGuards(GoogleOAuthGuard)
  @ApiExcludeEndpoint()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() req: any) {}

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
  async googleAuthRedirect(@Req() req: CustomApiRequest, @Res() res: Response) {
    const user = req.user as GoogleUserDto;
    const redirectUrl = await this.appService.loginWithGoogle(user);
    return res.redirect(redirectUrl);
  }

  @Post('auth/refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Authentication'],
    summary: 'Refresh Access Token',
    description:
      'Refresh JWT access token using the refresh token stored in cookies',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'New access token generated successfully',
    type: LoginResponseDto,
  })
  async refreshNewAccessToken(
    @Body() data: RefreshNewAccessTokenDto,
  ): Promise<CustomApiResponse<{ accessToken: string }>> {
    console.log('Refreshing access token with:', data.refreshToken);
    const result = await this.appService.refreshNewAccessToken(data);
    return result;
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
