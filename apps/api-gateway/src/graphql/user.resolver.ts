import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AppService } from '../app.service';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { RoleEnum } from '@app/shared/enums/role.enum';
import { RoleGuard } from '../guards/role.guard';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { CacheInterceptor } from '../interceptors/cache.interceptor';
import { UserDto } from '@app/shared/dtos/users/user.dto';
import { OrderDto } from '@app/shared/dtos/orders/order.dto';

@Resolver(() => UserDto)
@UseInterceptors(CacheInterceptor)
export class UserResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => [UserDto], { name: 'users' })
  @UseGuards(AuthGuard)
  async findUsers(
    @PaginationParams() pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<UserDto[]> {
    const users = await this.appService.findAllUsers({
      pagination,
      sort,
      filter,
    } as FindOptions);
    return users.items as UserDto[];
  }

  @Query(() => UserDto, { name: 'user' })
  @CheckRoles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async findUserById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<UserDto> {
    const user = this.appService.findUserById(id);
    return user;
  }

  @ResolveField(() => [OrderDto], { name: 'orders' })
  async findUserOrders(@Parent() user: UserDto): Promise<OrderDto[]> {
    return this.appService.findUserOrders(user.id);
  }
}
