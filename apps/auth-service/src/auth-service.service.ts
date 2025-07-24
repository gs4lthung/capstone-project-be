import { ConfigService } from '@app/config';
import { User } from '@app/database/entities/user.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CustomRcpException } from '@app/shared/exceptions/custom-rcp.exception';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.request.dto';
import { LoginRequestDto } from '@app/shared/dtos/auth/login.request.dto';
import { LoginResponseDto } from '@app/shared/dtos/auth/login.response.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from '@app/shared/dtos/auth/jwt.payload.dto';

@Injectable()
export class AuthServiceService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    data: LoginRequestDto,
  ): Promise<CustomApiResponse<LoginResponseDto>> {
    try {
      if (!data)
        throw new CustomRcpException(
          'Invalid login data',
          HttpStatus.BAD_REQUEST,
        );

      const user = await this.userRepository.findOne({
        where: { email: data.email },
      });
      if (!user)
        throw new CustomRcpException('User not found', HttpStatus.NOT_FOUND);

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password,
      );
      if (!isPasswordValid)
        throw new CustomRcpException(
          'Invalid password',
          HttpStatus.UNAUTHORIZED,
        );

      const payload: JwtPayloadDto = {
        id: user.id,
      };

      return new CustomApiResponse<LoginResponseDto>(
        HttpStatus.OK,
        'Login successful',
        {
          accessToken: await this.jwtService.signAsync(payload),
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
          },
        },
      );
    } catch (error) {
      if (error instanceof CustomRcpException) {
        throw error;
      }
      throw new CustomRcpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.stack,
      );
    }
  }

  async register(data: RegisterRequestDto): Promise<CustomApiResponse<void>> {
    try {
      if (!data)
        throw new CustomRcpException(
          'Invalid registration data',
          HttpStatus.BAD_REQUEST,
        );

      const isEmailExists = await this.userRepository.findOne({
        where: { email: data.email },
      });
      if (isEmailExists)
        throw new CustomRcpException(
          'Email already exists',
          HttpStatus.CONFLICT,
        );

      const passwordHashed = await bcrypt.hash(
        data.password,
        this.configService.get('password_salt_rounds'),
      );

      const user = this.userRepository.create({
        fullName: data.fullName,
        email: data.email,
        password: passwordHashed,
      });

      await this.userRepository.save(user);

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'Registration successful',
      );
    } catch (error) {
      if (error instanceof CustomRcpException) {
        throw error;
      }
      throw new CustomRcpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.stack,
      );
    }
  }
}
