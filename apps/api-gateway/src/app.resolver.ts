import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { AppService } from './app.service';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { User } from '@app/database/entities/user.entity';
import { RoleGuard } from './guards/role.guard';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { RoleEnum } from '@app/shared/enums/role.enum';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { PaginatedGqlArgs } from '@app/shared/dtos/paginated-gql-args.dto';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';

@Resolver()
@UseInterceptors(CacheInterceptor)
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  //#region Users

  @Query(() => [User], { name: 'users' })
  @UseGuards(AuthGuard)
  async getUsers(
    @Args() paginatedArgs: PaginatedGqlArgs,
    @PaginationParams() pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<User[]> {
    const users = await this.appService.findAllUsers({
      pagination,
      sort,
      filter,
    } as FindOptions);
    return users.items as User[];
  }

  @Query(() => User, { name: 'user' })
  @CheckRoles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async getUserById(@Args('id', { type: () => Int }) id: number) {
    const user = this.appService.findUserById(id);
    return user;
  }

  //#endregion Users
}
