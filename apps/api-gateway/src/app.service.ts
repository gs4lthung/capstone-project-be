import { ConfigService } from '@app/config';
import { LoginRequestDto } from '@app/shared/dtos/auth/login.request.dto';
import { LoginResponseDto } from '@app/shared/dtos/auth/login.response.dto';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.request.dto';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { map } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  login(data: LoginRequestDto) {
    const pattern = { cmd: 'login' };
    const payload = data;
    return this.authService
      .send<CustomApiResponse<LoginResponseDto>>(pattern, payload)
      .pipe(
        map((response) => {
          return response;
        }),
      );
  }

  register(data: RegisterRequestDto) {
    const pattern = { cmd: 'register' };
    const payload = data;
    return this.authService
      .send<CustomApiResponse<void>>(pattern, payload)
      .pipe(
        map((response) => {
          return response;
        }),
      );
  }
}
