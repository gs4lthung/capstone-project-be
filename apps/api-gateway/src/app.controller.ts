import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { RegisterDto } from '@app/shared/dtos/auth/register.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('auth/register')
  async register(@Body() data: RegisterDto) {
    return this.appService.register(data);
  }
}
