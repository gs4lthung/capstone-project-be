import { Controller } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { User } from '@app/database/entities/user.entity';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { CreateUserDto } from '@app/shared/dtos/users/create-user.dto';
import { PaginatedResource } from '@app/shared/dtos/paginated-resource.dto';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';

@Controller()
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @MessagePattern({ cmd: 'findAllUsers' })
  async findAll(
    findOptions: FindOptions,
  ): Promise<PaginatedResource<Partial<User>>> {
    return this.userServiceService.findAll(findOptions);
  }

  @MessagePattern({ cmd: 'findUserById' })
  async findOne(id: number): Promise<User> {
    return this.userServiceService.findOne(id);
  }

  @MessagePattern({ cmd: 'createUser' })
  async createUser(data: CreateUserDto): Promise<CustomApiResponse<void>> {
    return this.userServiceService.createUser(data);
  }

  @MessagePattern({ cmd: 'updateMyAvatar' })
  async updateMyAvatar({
    id,
    file,
  }: {
    id: number;
    file: Express.Multer.File;
  }): Promise<CustomApiResponse<void>> {
    return this.userServiceService.updateMyAvatar(id, file);
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
