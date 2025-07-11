import { ConfigService } from '@app/config';
import { User } from '@app/database/entities/user.entity';
import { RegisterDto } from '@app/shared/dtos/auth/register.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthServiceService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async login(): Promise<string> {
    return 'Login successful for user: ';
  }

  async register(data: RegisterDto): Promise<string> {
    const isEmailExists = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (isEmailExists) throw new BadRequestException('Email already exists');

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

    return `Registration successful for user: ${data.fullName}`;
  }
}
