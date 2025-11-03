import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { UserService } from '../services/user.service';
import { PaginatedGqlArgs } from '@app/shared/graphql/paginated-gql-args';
import { PaginatedUser, User } from '@app/database/entities/user.entity';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

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
    return users;
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(AuthGuard)
  async findUserById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<User> {
    const user = this.userService.findOne(id);
    return user;
  }
}
