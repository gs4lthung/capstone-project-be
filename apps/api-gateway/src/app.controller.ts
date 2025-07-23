import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.request.dto';
import { LoginRequestDto } from '@app/shared/dtos/auth/login.request.dto';
import { AuthGuard } from './guards/auth.guard';
import { LoginResponseDto } from '@app/shared/dtos/auth/login.response.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('auth/login')
  @ApiOperation({
    summary: 'User Login',
    description: 'Authenticate user and return JWT access token and user info',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
    type: LoginResponseDto,
  })
  async login(@Body() data: LoginRequestDto) {
    return this.appService.login(data);
  }

  @UseGuards(AuthGuard)
  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User Registration',
    description: 'Register a new user with full name, email, and password',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
  })
  async register(@Body() data: RegisterRequestDto) {
    return this.appService.register(data);
  }
}
