import { Controller } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.dto';
import {
  LoginRequestDto,
  LoginResponseDto,
} from '@app/shared/dtos/auth/login.dto';
import { GoogleUserDto } from '@app/shared/dtos/auth/google-user.dto';
import { ResetPasswordDto } from '@app/shared/dtos/auth/reset-password.dto';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @MessagePattern({ cmd: 'login' })
  async login(
    data: LoginRequestDto,
  ): Promise<CustomApiResponse<LoginResponseDto>> {
    return this.authServiceService.login(data);
  }

  @MessagePattern({ cmd: 'login_with_google' })
  async loginWithGoogle(data: GoogleUserDto): Promise<string> {
    return this.authServiceService.loginWithGoogle(data);
  }

  @MessagePattern({ cmd: 'register' })
  async register(data: RegisterRequestDto): Promise<CustomApiResponse<void>> {
    return this.authServiceService.register(data);
  }

  @MessagePattern({ cmd: 'verify_email' })
  async verifyEmail(data: { token: string }): Promise<string> {
    return this.authServiceService.verifyEmail(data);
  }

  @MessagePattern({ cmd: 'refresh_new_access_token' })
  async refreshNewAccessToken(data: {
    refreshToken: string;
  }): Promise<CustomApiResponse<{ accessToken: string }>> {
    return this.authServiceService.refreshNewAccessToken(data);
  }

  @MessagePattern({ cmd: 'request_reset_password' })
  async requestResetPassword(data: {
    email: string;
  }): Promise<CustomApiResponse<void>> {
    return this.authServiceService.requestResetPassword(data);
  }

  @MessagePattern({ cmd: 'reset_password' })
  async resetPassword(
    data: ResetPasswordDto,
  ): Promise<CustomApiResponse<void>> {
    return this.authServiceService.resetPassword(data);
  }
}
