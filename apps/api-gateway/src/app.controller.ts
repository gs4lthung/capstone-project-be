import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.request.dto';
import { LoginRequestDto } from '@app/shared/dtos/auth/login.request.dto';
import { LoginResponseDto } from '@app/shared/dtos/auth/login.response.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
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

  @Get('users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get All Users',
    description: 'Retrieve a list of all users',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
  })
  async findAllUsers() {
    return this.appService.findAllUsers();
  }

  @Get('users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get User by ID',
    description: 'Retrieve a user by their unique ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
  })
  async findUserById(@Param('id') id: number) {
    return this.appService.findUserById(id);
  }
}
