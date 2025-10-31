import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  CreateWalletDto,
  UpdateWalletDto,
} from '@app/shared/dtos/wallets/wallet.dto';
import { AuthGuard } from '../guards/auth.guard';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

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
}
