import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { AppService } from './app.service';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { User } from '@app/database/entities/user.entity';
import { RoleGuard } from './guards/role.guard';
import { CheckRoleDecorator } from '@app/shared/decorators/role.decorator';
import { RoleEnum } from '@app/shared/enums/role.enum';
import { CacheInterceptor } from './interceptors/cache.interceptor';

@Resolver()
@UseInterceptors(CacheInterceptor)
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => [User], { name: 'users' })
  @UseGuards(AuthGuard)
  async getUsers() {
    const users = this.appService.findAllUsers();
    return users;
  }

  @Query(() => User, { name: 'user' })
  @CheckRoleDecorator(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async getUserById(@Args('id', { type: () => Int }) id: number) {
    const user = this.appService.findUserById(id);
    return user;
  }
}
