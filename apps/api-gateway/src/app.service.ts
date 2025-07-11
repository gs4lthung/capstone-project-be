import { ConfigService } from '@app/config';
import { RegisterDto } from '@app/shared/dtos/auth/register.dto';
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

  register(data: RegisterDto) {
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
