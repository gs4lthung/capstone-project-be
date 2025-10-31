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
import { WalletService } from '../services/wallet.service';
import { PaginatedGqlArgs } from '@app/shared/graphql/paginated-gql-args';
import { PaginatedWallet, Wallet } from '@app/database/entities/wallet.entity';

@Resolver(() => Wallet)
export class WalletResolver {
  constructor(private readonly walletService: WalletService) {}

  @Query(() => PaginatedWallet, { name: 'wallets' })
  @UseGuards(AuthGuard)
  async findWallets(
    @Args() args: PaginatedGqlArgs,
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<PaginatedWallet> {
    const wallets = await this.walletService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);
    return wallets;
  }

  @Query(() => Wallet, { name: 'wallet' })
  @UseGuards(AuthGuard)
  async findWalletById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Wallet> {
    const wallet = this.walletService.findOne(id);
    return wallet;
  }
}
