import { Bank } from '@app/database/entities/bank.entity';
import { User } from '@app/database/entities/user.entity';
import { Wallet } from '@app/database/entities/wallet.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CreateWalletDto } from '@app/shared/dtos/wallets/wallet.dto';
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class WalletService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
  ) {}

  async createWallet(data: CreateWalletDto): Promise<CustomApiResponse<void>> {
    const bank = await this.bankRepository.findOne({
      where: { id: data.bankId },
    });
    const newWallet = this.walletRepository.create({
      user: { id: this.request.user.id as User['id'] },
      bank: bank,
      bankAccountNumber: data.bankAccountNumber,
    });
    await this.walletRepository.save(newWallet);

    return new CustomApiResponse<void>(HttpStatus.CREATED, 'Tạo ví thành công');
  }
}
