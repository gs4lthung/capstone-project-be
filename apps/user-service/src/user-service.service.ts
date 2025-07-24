import { User } from '@app/database/entities/user.entity';
import { CustomRcpException } from '@app/shared/exceptions/custom-rcp.exception';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserServiceService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<CustomApiResponse<User[]>> {
    try {
      const users = await this.userRepository.find();
      return new CustomApiResponse<User[]>(
        HttpStatus.OK,
        'Users retrieved successfully',
        users,
      );
    } catch (error) {
      if (error instanceof CustomRcpException) {
        throw error;
      }
      throw new CustomRcpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.stack,
      );
    }
  }

  async findOne(id: number): Promise<CustomApiResponse<User>> {
    try {
      const user = await this.userRepository.findOneBy({
        id: id,
      });

      if (!user)
        throw new CustomRcpException('User not found', HttpStatus.NOT_FOUND);

      return new CustomApiResponse<User>(
        HttpStatus.OK,
        'User retrieved successfully',
        user,
      );
    } catch (error) {
      if (error instanceof CustomRcpException) {
        throw error;
      }
      throw new CustomRcpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.stack,
      );
    }
  }
}
