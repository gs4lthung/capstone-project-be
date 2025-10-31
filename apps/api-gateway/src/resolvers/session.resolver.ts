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
import { SessionService } from '../services/session.service';
import { PaginatedGqlArgs } from '@app/shared/graphql/paginated-gql-args';
import {
  PaginatedSession,
  Session,
} from '@app/database/entities/session.entity';

@Resolver(() => Session)
export class SessionResolver {
  constructor(private readonly sessionService: SessionService) {}

  @Query(() => PaginatedSession, { name: 'sessions' })
  @UseGuards(AuthGuard)
  async findSessions(
    @Args() args: PaginatedGqlArgs,
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<PaginatedSession> {
    const sessions = await this.sessionService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);
    return sessions;
  }

  @Query(() => Session, { name: 'session' })
  @UseGuards(AuthGuard)
  async findSessionById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Session> {
    const session = this.sessionService.findOne(id);
    return session;
  }
}
