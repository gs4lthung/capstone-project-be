import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateWalletDto } from '@app/shared/dtos/wallets/wallet.dto';
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
  async createWallet(@Body() data: CreateWalletDto) {
    return this.walletService.createWallet(data);
  }
}
