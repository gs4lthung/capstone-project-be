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
import { PaymentService } from '../services/payment.service';
import { PaginatedGqlArgs } from '@app/shared/graphql/paginated-gql-args';
import {
  PaginatedPayment,
  Payment,
} from '@app/database/entities/payment.entity';

@Resolver(() => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Query(() => PaginatedPayment, { name: 'payments' })
  @UseGuards(AuthGuard)
  async findPayments(
    @Args() args: PaginatedGqlArgs,
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<PaginatedPayment> {
    const payments = await this.paymentService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);
    return payments;
  }

  @Query(() => Payment, { name: 'payment' })
  @UseGuards(AuthGuard)
  async findPaymentById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Payment> {
    const payment = this.paymentService.findOne(id);
    return payment;
  }
}
