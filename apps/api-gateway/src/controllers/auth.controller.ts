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
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { Response } from 'express';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { GoogleUserDto } from '@app/shared/dtos/auth/google-user.dto';
import { AuthService } from '../services/auth.service';
import { GoogleOAuthGuard } from '../guards/google-auth.guard';
import { AuthGuard } from '../guards/auth.guard';
import {
  RegisterRequestDto,
  VerifyPhoneDto,
} from '@app/shared/dtos/auth/register.dto';
import { RefreshNewAccessTokenDto } from '@app/shared/dtos/auth/refresh-new-access-token.dto';
import { ResetPasswordDto } from '@app/shared/dtos/auth/reset-password.dto';
import {
  CurrentUserResponseDto,
  LoginRequestDto,
  LoginResponseDto,
} from '@app/shared/dtos/auth/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
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
  ): Promise<CustomApiResponse<LoginResponseDto>> {
    const result = await this.authService.login(data);
    return result;
  }

  @Get('current-user')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Authentication'],
    summary: 'Get Current User',
    description: 'Retrieve the currently authenticated user information',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user information retrieved successfully',
  })
  @UseGuards(AuthGuard)
  async me(): Promise<CustomApiResponse<CurrentUserResponseDto>> {
    const res = await this.authService.getCurrentUser();
    return res;
  }

  @Post('register')
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
    return this.authService.register(data);
  }

  @Get('verify-email')
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
    const redirectUrl = await this.authService.verifyEmail({ token });
    return res.redirect(redirectUrl);
  }

  @Post('verify-phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Authentication'],
    summary: 'Verify Phone Number',
    description: 'Verify user phone number using the token sent via SMS',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Phone number successfully verified',
  })
  async verifyPhone(@Body() data: VerifyPhoneDto) {
    return this.authService.verifyPhone(data);
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiExcludeEndpoint()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() req: any) {}

  @Get('google-redirect')
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
    const redirectUrl = await this.authService.loginWithGoogle(user);
    return res.redirect(redirectUrl);
  }

  @Post('refresh')
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
    const result = await this.authService.refreshNewAccessToken(data);
    return result;
  }

  @Post('request-reset-password')
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
    return this.authService.requestResetPassword(data);
  }

  @Post('reset-password')
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
    return this.authService.resetPassword(data);
  }
}
