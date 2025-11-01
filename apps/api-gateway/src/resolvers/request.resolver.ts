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
import { RequestService } from '../services/request.service';
import { PaginatedGqlArgs } from '@app/shared/graphql/paginated-gql-args';
import {
  PaginatedRequest,
  Request,
} from '@app/database/entities/request.entity';

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

  @Query(() => Request, { name: 'request' })
  @UseGuards(AuthGuard)
  async findRequestById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Request> {
    const request = this.requestService.findOne(id);
    return request;
  }
}
