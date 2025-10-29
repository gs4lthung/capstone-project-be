import { Subject } from '@app/database/entities/subject.entity';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { SubjectService } from '../services/subject.service';
import { PaginatedGqlArgs } from '@app/shared/graphql/paginated-gql-args';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { PaginatedSubject } from '@app/shared/dtos/subjects/subject.dto';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';

@Resolver(() => Subject)
export class SubjectResolver {
  constructor(private readonly subjectService: SubjectService) {}

  @Query(() => PaginatedSubject, { name: 'subjects' })
  @UseGuards(AuthGuard)
  async findSubjects(
    @Args() args: PaginatedGqlArgs,
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<PaginatedSubject> {
    const requests = await this.subjectService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);
    return requests;
  }
}
