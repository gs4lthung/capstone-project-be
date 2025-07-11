import { Controller, Get } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { RegisterDto } from '@app/shared/dtos/auth/register.dto';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @Get()
  getHello(): string {
    return this.authServiceService.getHello();
  }

  @MessagePattern({ cmd: 'login' })
  async login(): Promise<string> {
    return 'Login successful for user: ';
  }

  @MessagePattern({ cmd: 'register' })
  async register(data: RegisterDto): Promise<string> {
    return this.authServiceService.register(data);
  }
}
