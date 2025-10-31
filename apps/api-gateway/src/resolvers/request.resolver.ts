import {
  PaginatedRequest,
  Request,
} from '@app/database/entities/request.entity';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { RequestService } from '../services/request.service';
import { UseGuards } from '@nestjs/common';
import { PaginatedGqlArgs } from '@app/shared/graphql/paginated-gql-args';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { AuthGuard } from '../guards/auth.guard';

@Resolver(() => Request)
export class RequestResolver {
  constructor(private readonly requestService: RequestService) {}

  @Query(() => PaginatedRequest, { name: 'requests' })
  @UseGuards(AuthGuard)
  async findRequests(
    @Args() args: PaginatedGqlArgs,
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<PaginatedRequest> {
    const requests = await this.requestService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);
    return requests;
  }
}
