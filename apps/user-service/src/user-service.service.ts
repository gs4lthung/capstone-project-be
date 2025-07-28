import { User } from '@app/database/entities/user.entity';
import { UserResponseDto } from '@app/shared/dtos/users/user.response.dto';
import { CustomRpcException } from '@app/shared/exceptions/custom-rpc.exception';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserServiceService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    try {
      const users = await this.userRepository.find({ relations: ['role'] });
      return users.map(
        (user) =>
          new UserResponseDto(user.id, user.fullName, user.email, user.role),
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async findOne(id: number): Promise<CustomApiResponse<UserResponseDto>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: id },
        relations: ['role'],
      });

      if (!user)
        throw new CustomRpcException('User not found', HttpStatus.NOT_FOUND);

      return new CustomApiResponse<UserResponseDto>(
        HttpStatus.OK,
        'User retrieved successfully',
        new UserResponseDto(user.id, user.fullName, user.email, user.role),
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
