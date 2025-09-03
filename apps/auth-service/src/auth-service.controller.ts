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
import { AuthMsgPattern } from '@app/shared/msg_patterns/auth.msg_pattern';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @MessagePattern({ cmd: AuthMsgPattern.LOGIN })
  async login(
    data: LoginRequestDto,
  ): Promise<CustomApiResponse<LoginResponseDto>> {
    return this.authServiceService.login(data);
  }

  @MessagePattern({ cmd: AuthMsgPattern.LOGIN_WITH_GOOGLE })
  async loginWithGoogle(data: GoogleUserDto): Promise<string> {
    return this.authServiceService.loginWithGoogle(data);
  }

  @MessagePattern({ cmd: AuthMsgPattern.REGISTER })
  async register(data: RegisterRequestDto): Promise<CustomApiResponse<void>> {
    return this.authServiceService.register(data);
  }

  @MessagePattern({ cmd: AuthMsgPattern.VERIFY_EMAIL })
  async verifyEmail(data: { token: string }): Promise<string> {
    return this.authServiceService.verifyEmail(data);
  }

  @MessagePattern({ cmd: AuthMsgPattern.REFRESH_NEW_ACCESS_TOKEN })
  async refreshNewAccessToken(data: {
    refreshToken: string;
  }): Promise<CustomApiResponse<{ accessToken: string }>> {
    return this.authServiceService.refreshNewAccessToken(data);
  }

  @MessagePattern({ cmd: AuthMsgPattern.REQUEST_RESET_PASSWORD })
  async requestResetPassword(data: {
    email: string;
  }): Promise<CustomApiResponse<void>> {
    return this.authServiceService.requestResetPassword(data);
  }

  @MessagePattern({ cmd: AuthMsgPattern.RESET_PASSWORD })
  async resetPassword(
    data: ResetPasswordDto,
  ): Promise<CustomApiResponse<void>> {
    return this.authServiceService.resetPassword(data);
  }
}
