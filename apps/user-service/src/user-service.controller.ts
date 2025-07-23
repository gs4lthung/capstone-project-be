import { Controller } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { User } from '@app/database/entities/user.entity';

@Controller()
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @MessagePattern({ cmd: 'findAll' })
  async findAll(): Promise<CustomApiResponse<User[]>> {
    return this.userServiceService.findAll();
  }
}
