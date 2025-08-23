import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
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
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { Response } from 'express';
import { RefreshNewAccessTokenDto } from '@app/shared/dtos/auth/refresh-new-access-token.dto';
import { I18nResponseInterceptor } from './interceptors/i18-response.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from '@app/shared/dtos/users/create-user.dto';
import { RoleGuard } from './guards/role.guard';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { RoleEnum } from '@app/shared/enums/role.enum';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { CreatePaymentLinkRequestDto } from '@app/shared/dtos/payments/create-payment-link.dto';
import { ResetPasswordDto } from '@app/shared/dtos/auth/reset-password.dto';

@Controller()
@UseInterceptors(I18nResponseInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  //#region Authentication

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
  async googleAuthRedirect(
    @CurrentUser('google') user: GoogleUserDto,
    @Res() res: Response,
  ) {
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
    const result = await this.appService.refreshNewAccessToken(data);
    return result;
  }

  @Post('auth/request-reset-password')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    tags: ['Authentication'],
    summary: 'Request Password Reset',
    description: "Request a password reset link to be sent to the user's email",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Password reset email sent successfully',
    type: String,
  })
  async requestResetPassword(
    @Body() data: { email: string },
  ): Promise<CustomApiResponse<void>> {
    return this.appService.requestResetPassword(data);
  }

  @Post('auth/reset-password')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    tags: ['Authentication'],
    summary: 'Reset Password',
    description: 'Reset the user password',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User password reset successfully',
  })
  async resetPassword(
    @Body() data: ResetPasswordDto,
  ): Promise<CustomApiResponse<void>> {
    return this.appService.resetPassword(data);
  }

  //#endregion Authentication

  //#region Users
  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    tags: ['Users'],
    summary: 'Create User',
    description: 'Create a new user',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
  })
  @CheckRoles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async createUser(
    @Body() data: CreateUserDto,
  ): Promise<CustomApiResponse<void>> {
    return this.appService.createUser(data);
  }

  @Put('users/me/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Users'],
    summary: 'Update User Avatar',
    description: 'Update the avatar image of a user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User avatar updated successfully',
  })
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async updateMyAvatar(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    return this.appService.updateMyAvatar(file);
  }

  @Delete('users/:id/soft')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Users'],
    summary: 'Delete User',
    description: 'Delete a user by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  @CheckRoles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async softDeleteUser(
    @Param('id') id: number,
  ): Promise<CustomApiResponse<void>> {
    return this.appService.softDeleteUser(id);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Users'],
    summary: 'Delete User',
    description: 'Delete a user by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  @CheckRoles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async deleteUser(@Param('id') id: number): Promise<CustomApiResponse<void>> {
    return this.appService.deleteUser(id);
  }

  @Delete('users/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Users'],
    summary: 'Restore User',
    description: 'Restore a soft-deleted user by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User restored successfully',
  })
  @CheckRoles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async restoreUser(@Param('id') id: number): Promise<CustomApiResponse<void>> {
    return this.appService.restoreUser(id);
  }

  //#endregion Users

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

  //#region Payment

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

  //#endregion Payment
}
