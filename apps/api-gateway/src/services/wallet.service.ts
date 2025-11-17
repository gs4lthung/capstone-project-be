import { Bank } from '@app/database/entities/bank.entity';
import { User } from '@app/database/entities/user.entity';
import { Wallet } from '@app/database/entities/wallet.entity';
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
import { DataSource, Repository } from 'typeorm';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { WalletTransactionType } from '@app/shared/enums/payment.enum';
import { WalletTransaction } from '@app/database/entities/wallet-transaction.entity';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';

@Injectable({ scope: Scope.REQUEST })
export class WalletService extends BaseTypeOrmService<Wallet> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    private readonly datasource: DataSource,
  ) {
    super(walletRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginateObject<Wallet>> {
    return super.find(findOptions, 'wallet', PaginateObject<Wallet>);
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

  async findBanks(): Promise<Bank[]> {
    return await this.bankRepository.find();
  }

  async findByUserId(): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: this.request.user.id as User['id'] } },
      withDeleted: false,
      relations: ['bank', 'transactions', 'withdrawalRequests'],
    });
    if (!wallet) throw new Error('Wallet not found');
    return wallet;
  }

  async create(data: CreateWalletDto): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const bank = await manager.getRepository(Bank).findOne({
        where: { id: data.bankId },
      });
      const newWallet = manager.getRepository(Wallet).create({
        user: { id: this.request.user.id as User['id'] },
        bank: bank,
        bankAccountNumber: data.bankAccountNumber,
      });
      await manager.getRepository(Wallet).save(newWallet);

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'Tạo ví thành công',
      );
    });
  }

  async update(
    id: number,
    data: UpdateWalletDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const wallet = await manager.getRepository(Wallet).findOne({
        where: { id: id },
        withDeleted: false,
      });
      if (!wallet) throw new InternalServerErrorException('Wallet not found');
      await manager.getRepository(Wallet).update(wallet.id, data);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Cập nhật ví thành công',
      );
    });
  }

  async handleWalletTopUp(userId: User['id'], amount: number): Promise<void> {
    return await this.datasource.transaction(async (manager) => {
      const wallet = await manager.getRepository(Wallet).findOne({
        where: { user: { id: userId } },
        withDeleted: false,
      });
      if (!wallet) throw new InternalServerErrorException('Wallet not found');

      const currentBalance = Number(wallet.currentBalance ?? 0);
      const totalIncome = Number(wallet.totalIncome ?? 0);
      const newCurrent = currentBalance + amount;
      const newTotal = totalIncome + amount;

      wallet.currentBalance = newCurrent;
      wallet.totalIncome = newTotal;
      await manager.getRepository(Wallet).save(wallet);

      const newTransaction = manager.getRepository(WalletTransaction).create({
        wallet: wallet,
        type: WalletTransactionType.CREDIT,
        amount: amount,
      });
      await manager.getRepository(WalletTransaction).save(newTransaction);
    });
  }
}
