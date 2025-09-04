import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { CacheInterceptor } from '../interceptors/cache.interceptor';
import { PaginatedUser, UserDto } from '@app/shared/dtos/users/user.dto';
import { OrderDto } from '@app/shared/dtos/orders/order.dto';
import { ChatDto } from '@app/shared/dtos/chats/chat.dto';
import { UserService } from '../services/user.service';
import { OrderService } from '../services/order.service';
import { ChatService } from '../services/chat.service';
import { PaginatedGqlArgs } from '@app/shared/graphql/paginated-gql-args';

@Resolver(() => UserDto)
@UseInterceptors(CacheInterceptor)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly orderService: OrderService,
    private readonly chatService: ChatService,
  ) {}

  @Query(() => PaginatedUser, { name: 'users' })
  @UseGuards(AuthGuard)
  async findUsers(
    @Args() args: PaginatedGqlArgs,
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<PaginatedUser> {
    const users = await this.userService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);

    console.log(users);

    return users;
  }

  @Query(() => UserDto, { name: 'user' })
  @UseGuards(AuthGuard)
  async findUserById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<UserDto> {
    const user = this.userService.findOne(id);
    return user;
  }

  @ResolveField(() => [OrderDto], { name: 'user_orders' })
  async findUserOrders(@Parent() user: UserDto): Promise<OrderDto[]> {
    return this.orderService.findUserOrders(user.id);
  }

  @ResolveField(() => [ChatDto], { name: 'user_chats' })
  async findUserChats(@Parent() user: UserDto): Promise<ChatDto[]> {
    return this.chatService.findUserChats(user.id);
  }
}
