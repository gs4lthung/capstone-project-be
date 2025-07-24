import { Query, Resolver } from '@nestjs/graphql';
import { AppService } from './app.service';
import { UserResponseDto } from '@app/shared/dtos/users/user.response.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';

@Resolver()
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => [UserResponseDto], { name: 'users' })
  @UseGuards(AuthGuard)
  async getUsers() {
    const users = this.appService.findAllUsers();
    return users;
  }
}
