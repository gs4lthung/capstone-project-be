import { Controller } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { UserResponseDto } from '@app/shared/dtos/users/user.response.dto';

@Controller()
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @MessagePattern({ cmd: 'findAllUsers' })
  async findAll(): Promise<UserResponseDto[]> {
    return this.userServiceService.findAll();
  }

  @MessagePattern({ cmd: 'findUserById' })
  async findOne(id: number): Promise<CustomApiResponse<UserResponseDto>> {
    return this.userServiceService.findOne(id);
  }
}
