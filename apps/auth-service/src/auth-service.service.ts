import { ConfigService } from '@app/config';
import { User } from '@app/database/entities/user.entity';
import { RegisterDto } from '@app/shared/dtos/auth/register.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CustomRcpException } from '@app/shared/exceptions/custom-rcp.exception';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';

@Injectable()
export class AuthServiceService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async login(): Promise<string> {
    return 'Login successful for user: ';
  }

  async register(data: RegisterDto): Promise<CustomApiResponse<void>> {
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
