import { Controller } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { User } from '@app/database/entities/user.entity';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { UserMsgPattern } from '@app/shared/msg_patterns/user.msg_pattern';
import { PaginatedUser } from '@app/shared/dtos/users/user.dto';
import { CreateUserDto } from '@app/shared/dtos/users/create-user.dto';

@Controller()
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @MessagePattern({ cmd: UserMsgPattern.FIND_ALL_USERS })
  async findAll(findOptions: FindOptions): Promise<PaginatedUser> {
    return this.userServiceService.findAll(findOptions);
  }

  @MessagePattern({ cmd: UserMsgPattern.FIND_USER_BY_ID })
  async findOne(id: number): Promise<User> {
    return this.userServiceService.findOne(id);
  }

  @MessagePattern({ cmd: UserMsgPattern.CREATE_USER })
  async create(data: CreateUserDto): Promise<CustomApiResponse<void>> {
    return this.userServiceService.create(data);
  }

  @MessagePattern({ cmd: UserMsgPattern.UPDATE_MY_AVATAR })
  async updateMyAvatar({
    id,
    file,
  }: {
    id: number;
    file: Express.Multer.File;
  }): Promise<CustomApiResponse<void>> {
    return this.userServiceService.updateMyAvatar(id, file);
  }

  @MessagePattern({ cmd: UserMsgPattern.SOFT_DELETE_USER })
  async softDelete(id: number): Promise<CustomApiResponse<void>> {
    return this.userServiceService.softDelete(id);
  }

  @MessagePattern({ cmd: UserMsgPattern.DELETE_USER })
  async delete(id: number): Promise<CustomApiResponse<void>> {
    return this.userServiceService.delete(id);
  }

  @MessagePattern({ cmd: UserMsgPattern.RESTORE_USER })
  async restore(id: number): Promise<CustomApiResponse<void>> {
    return this.userServiceService.restore(id);
  }
}
