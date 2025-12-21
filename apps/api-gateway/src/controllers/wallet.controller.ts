import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  CreateWalletDto,
  UpdateWalletDto,
} from '@app/shared/dtos/wallets/wallet.dto';
import { AuthGuard } from '../guards/auth.guard';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { RoleGuard } from '../guards/role.guard';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Wallets'],
    summary: 'Get all wallets for the authenticated user',
    description: 'Retrieve a list of all wallets belonging to the user',
  })
  @UseGuards(AuthGuard)
  async findAll(
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ) {
    return this.walletService.findAll({
      pagination,
      sort,
      filter,
    });
  }

  @Get('all-with-user-info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Wallets'],
    summary: 'Get all wallets with user information',
    description: 'Retrieve a list of all wallets along with associated user info',
  })
  async findAllWithUserInfo(@Query('role') role: string) {
    return this.walletService.findAllWithUserInfo(role as UserRole);
  }


  @Get('banks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Wallets'],
    summary: 'Get list of banks',
    description: 'Retrieve a list of all available banks',
  })
  async findBanks() {
    return this.walletService.findBanks();
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Wallets'],
    summary: 'Get wallet by user ID',
    description: 'Retrieve wallet details for a specific user by their ID',
  })
  @UseGuards(AuthGuard)
  async findByUserId() {
    return this.walletService.findByUserId();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Wallets'],
    summary: 'Get a specific wallet by ID',
    description: 'Retrieve details of a specific wallet belonging to the user',
  })
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: number) {
    return this.walletService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Wallets'],
    summary: 'Create a new wallet for the user',
    description: 'Create a new wallet for the authenticated user',
  })
  @UseGuards(AuthGuard)
  async create(@Body() data: CreateWalletDto) {
    return this.walletService.create(data);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Wallets'],
    summary: 'Update an existing wallet',
    description: 'Update an existing wallet for the authenticated user',
  })
  @UseGuards(AuthGuard)
  async update(@Param('id') id: number, @Body() data: UpdateWalletDto) {
    return this.walletService.update(id, data);
  }

  @Post('withdrawal')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Wallets'],
    summary: 'Request a withdrawal from the wallet',
    description: "Create a withdrawal request from the user's wallet",
  })
  @UseGuards(AuthGuard)
  async requestWithdrawal(@Body('amount') amount: number) {
    return this.walletService.handleWithdrawalRequest(amount);
  }

  @Patch('withdrawal/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Wallets'],
    summary: 'Approve a withdrawal request',
    description: 'Approve a specific withdrawal request by its ID',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard,RoleGuard)
  async approveWithdrawal(@Param('id') id: number) {
    return this.walletService.approveWithdrawalRequest(id);
  }

  @Patch('withdrawal/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Wallets'],
    summary: 'Reject a withdrawal request',
    description: 'Reject a specific withdrawal request by its ID',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard,RoleGuard)
  async rejectWithdrawal(@Param('id') id: number) {
    return this.walletService.rejectWithdrawalRequest(id);
  }

}
