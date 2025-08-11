import { Controller } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { User } from '@app/database/entities/user.entity';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';

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

  @MessagePattern({ cmd: 'updateUserAvatar' })
  async updateUserAvatar(data: {
    id: number;
    file: Express.Multer.File;
  }): Promise<CustomApiResponse<void>> {
    return this.userServiceService.updateUserAvatar(data.id, data.file);
  }
}
