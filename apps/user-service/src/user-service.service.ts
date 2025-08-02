import { User } from '@app/database/entities/user.entity';
import { CustomRpcException } from '@app/shared/exceptions/custom-rpc.exception';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserServiceService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        relations: ['role', 'fcmTokens'],
      });
      return users;
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: id },
        relations: ['role', 'fcmTokens'],
      });
      console.log('User found:', user);

      if (!user)
        throw new CustomRpcException('User not found', HttpStatus.NOT_FOUND);

      return user;
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
