import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { GoogleUserDto } from '@app/shared/dtos/auth/google-user.dto';
import {
  LoginRequestDto,
  LoginResponseDto,
} from '@app/shared/dtos/auth/login.dto';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.dto';
import { ResetPasswordDto } from '@app/shared/dtos/auth/reset-password.dto';
import { AuthMsgPattern } from '@app/shared/msg_patterns/auth.msg_pattern';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}
  async login(data: LoginRequestDto) {
    const pattern = { cmd: AuthMsgPattern.LOGIN };
    const payload = data;

    const response = await lastValueFrom(
      this.authService
        .send<CustomApiResponse<LoginResponseDto>>(pattern, payload)
        .pipe(
          map((response) => {
            return response;
          }),
        ),
    );
    return response;
  }
  async getCurrentUser(userId: string) {
    const pattern = { cmd: AuthMsgPattern.GET_USER_PROFILE };
    const payload = { userId };
    const response = await lastValueFrom(
      this.authService.send<CustomApiResponse<any>>(pattern, payload),
    );
    return response;
  }

  async loginWithGoogle(data: GoogleUserDto) {
    const pattern = { cmd: AuthMsgPattern.LOGIN_WITH_GOOGLE };
    const payload = data;

    const response = await lastValueFrom(
      this.authService.send<string>(pattern, payload).pipe(
        map((response) => {
          return response;
        }),
      ),
    );
    return response;
  }

  async register(data: RegisterRequestDto) {
    const pattern = { cmd: AuthMsgPattern.REGISTER };
    const payload = data;

    const response = await lastValueFrom(
      this.authService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async verifyEmail(data: { token: string }) {
    const pattern = { cmd: AuthMsgPattern.VERIFY_EMAIL };
    const payload = data;

    const response = await lastValueFrom(
      this.authService.send<string>(pattern, payload),
    );
    return response;
  }
  async refreshNewAccessToken(data: { refreshToken: string }) {
    const pattern = { cmd: AuthMsgPattern.REFRESH_NEW_ACCESS_TOKEN };
    const payload = data;

    const response = await lastValueFrom(
      this.authService.send<CustomApiResponse<LoginResponseDto>>(
        pattern,
        payload,
      ),
    );
    return response;
  }

  async requestResetPassword(data: { email: string }) {
    const pattern = { cmd: AuthMsgPattern.REQUEST_RESET_PASSWORD };
    const payload = data;

    const response = await lastValueFrom(
      this.authService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async resetPassword(
    data: ResetPasswordDto,
  ): Promise<CustomApiResponse<void>> {
    const pattern = { cmd: AuthMsgPattern.RESET_PASSWORD };
    const payload = data;

    const response = await lastValueFrom(
      this.authService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }
}
