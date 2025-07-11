import { Controller } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { RegisterDto } from '@app/shared/dtos/auth/register.dto';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @MessagePattern({ cmd: 'login' })
  async login(): Promise<string> {
    return 'Login successful for user: ';
  }

  @MessagePattern({ cmd: 'register' })
  async register(data: RegisterDto): Promise<CustomApiResponse<void>> {
    return this.authServiceService.register(data);
  }
}
