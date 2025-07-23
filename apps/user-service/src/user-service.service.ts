import { User } from '@app/database/entities/user.entity';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserServiceService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<CustomApiResponse<User[]>> {
    const users = await this.userRepository.find();
    return {
      statusCode: 200,
      message: 'Users retrieved successfully',
      metadata: users,
    };
  }
}
