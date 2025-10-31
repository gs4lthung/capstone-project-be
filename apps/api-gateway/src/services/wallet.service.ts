import { Bank } from '@app/database/entities/bank.entity';
import { User } from '@app/database/entities/user.entity';
import { Wallet, PaginatedWallet } from '@app/database/entities/wallet.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  CreateWalletDto,
  UpdateWalletDto,
} from '@app/shared/dtos/wallets/wallet.dto';
import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';

@Injectable({ scope: Scope.REQUEST })
export class WalletService extends BaseTypeOrmService<Wallet> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
  ) {
    super(walletRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginatedWallet> {
    return super.find(findOptions, 'wallet', PaginatedWallet);
  }

  async findOne(id: number): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id: id },
      withDeleted: false,
      relations: ['user', 'bank', 'transactions'],
    });

    if (!wallet) throw new Error('Wallet not found');

    return wallet;
  }

  async create(data: CreateWalletDto): Promise<CustomApiResponse<void>> {
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

  async update(
    id: number,
    data: UpdateWalletDto,
  ): Promise<CustomApiResponse<void>> {
    const wallet = await this.walletRepository.findOne({
      where: { id: id },
      withDeleted: false,
    });
    if (!wallet) throw new InternalServerErrorException('Wallet not found');
    await this.walletRepository.update(wallet.id, data);

    return new CustomApiResponse<void>(HttpStatus.OK, 'Cập nhật ví thành công');
  }

  async handleWalletTopUp(userId: User['id'], amount: number): Promise<void> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
      withDeleted: false,
    });
    if (!wallet) throw new InternalServerErrorException('Wallet not found');

    const currentBalance = Number(wallet.currentBalance ?? 0);
    const totalIncome = Number(wallet.totalIncome ?? 0);
    const newCurrent = currentBalance + amount;
    const newTotal = totalIncome + amount;

    await this.walletRepository.update(wallet.id, {
      currentBalance: newCurrent,
      totalIncome: newTotal,
    });
  }
}
