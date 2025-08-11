import { Controller } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { User } from '@app/database/entities/user.entity';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { CreateUserDto } from '@app/shared/dtos/users/create-user.dto';

@Controller()
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @MessagePattern({ cmd: 'findAllUsers' })
  async findAll(): Promise<User[]> {
    return this.userServiceService.findAll();
  }

  @MessagePattern({ cmd: 'findUserById' })
  async findOne(id: number): Promise<User> {
    return this.userServiceService.findOne(id);
  }

  @MessagePattern({ cmd: 'createUser' })
  async createUser(data: CreateUserDto): Promise<CustomApiResponse<void>> {
    return this.userServiceService.createUser(data);
  }

  @MessagePattern({ cmd: 'updateUserAvatar' })
  async updateUserAvatar(data: {
    id: number;
    file: Express.Multer.File;
  }): Promise<CustomApiResponse<void>> {
    return this.userServiceService.updateUserAvatar(data.id, data.file);
  }

  @MessagePattern({ cmd: 'softDeleteUser' })
  async softDeleteUser(id: number): Promise<CustomApiResponse<void>> {
    return this.userServiceService.softDeleteUser(id);
  }

  @MessagePattern({ cmd: 'deleteUser' })
  async deleteUser(id: number): Promise<CustomApiResponse<void>> {
    return this.userServiceService.deleteUser(id);
  }

  @MessagePattern({ cmd: 'restoreUser' })
  async restoreUser(id: number): Promise<CustomApiResponse<void>> {
    return this.userServiceService.restoreUser(id);
  }
}
