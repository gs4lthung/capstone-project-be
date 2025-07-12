import { ConfigService } from '@app/config';
import { User } from '@app/database/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CustomRcpException } from '@app/shared/exceptions/custom-rcp.exception';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.request.dto';
import { LoginRequestDto } from '@app/shared/dtos/auth/login.request.dto';
import { LoginResponseDto } from '@app/shared/dtos/auth/login.response.dto';
import { JwtService } from '@nestjs/jwt';

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
    if (!data) throw new CustomRcpException('Invalid login data', 400);

    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (!user) throw new CustomRcpException('User not found', 404);

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) throw new CustomRcpException('Invalid password', 401);

    const payload = {
      id: user.id,
      email: user.email,
    };

    return new CustomApiResponse<LoginResponseDto>(200, 'Login successful', {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  }

  async register(data: RegisterRequestDto): Promise<CustomApiResponse<void>> {
    if (!data) throw new CustomRcpException('Invalid registration data', 400);

    const isEmailExists = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (isEmailExists)
      throw new CustomRcpException('Email already exists', 400);

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

    return new CustomApiResponse<void>(201, 'Registration successful');
  }
}
