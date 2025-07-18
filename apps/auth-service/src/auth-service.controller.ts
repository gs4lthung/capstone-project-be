import { Controller } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.request.dto';
import { LoginRequestDto } from '@app/shared/dtos/auth/login.request.dto';
import { LoginResponseDto } from '@app/shared/dtos/auth/login.response.dto';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @MessagePattern({ cmd: 'login' })
  async login(
    data: LoginRequestDto,
  ): Promise<CustomApiResponse<LoginResponseDto>> {
    return this.authServiceService.login(data);
  }

  @MessagePattern({ cmd: 'register' })
  async register(data: RegisterRequestDto): Promise<CustomApiResponse<void>> {
    return this.authServiceService.register(data);
  }
}
