import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.request.dto';
import { LoginRequestDto } from '@app/shared/dtos/auth/login.request.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('auth/login')
  async login(@Body() data: LoginRequestDto) {
    return this.appService.login(data);
  }

  @UseGuards(AuthGuard)
  @Post('auth/register')
  async register(@Body() data: RegisterRequestDto) {
    return this.appService.register(data);
  }
}
