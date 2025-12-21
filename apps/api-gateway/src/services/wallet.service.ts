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
import { DataSource, Repository,In } from 'typeorm';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { WalletTransactionType, WithdrawalRequestStatus } from '@app/shared/enums/payment.enum';
import { WalletTransaction } from '@app/database/entities/wallet-transaction.entity';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { WithdrawalRequest } from '@app/database/entities/withdrawal-request.entity';
import { NotificationService } from './notification.service';
import { NotificationType } from '@app/shared/enums/notification.enum';
import { Session } from '@app/database/entities/session.entity';
import { UserRole } from '@app/shared/enums/user.enum';

@Injectable({ scope: Scope.REQUEST })
export class WalletService extends BaseTypeOrmService<Wallet> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
    private readonly datasource: DataSource,
    private readonly notificationService: NotificationService
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

  async findAllWithUserInfo(role:string): Promise<Wallet[]> {
    // If role is provided and not ADMIN, filter by that role
    // If no role is provided, get all with COACH and LEARNER roles
    let whereClause: any = {};
    if (role && role !== UserRole.ADMIN) {
      whereClause = {
        user: {
          role: {
            name: role
          }
        }
      };
    } else {
      whereClause = {
        user: {
          role: {
            name: In([UserRole.COACH, UserRole.LEARNER])
          }
        }
      };
    }
    return await this.walletRepository.find({
      relations: ['user', 'user.role', 'bank', 'transactions', 'withdrawalRequests'],
      where: whereClause
    });
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

  async handleWithdrawalRequest(
    amount: number,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const wallet = await manager.getRepository(Wallet).findOne({
        where: { user: { id: this.request.user.id as User['id'] } },
        relations: ['user','bank'],
        withDeleted: false,
      });
      if (!wallet) throw new InternalServerErrorException('Ví không tồn tại');
      if(!wallet.bankAccountNumber||!wallet.bank)
        throw new InternalServerErrorException('Vui lòng cập nhật thông tin ngân hàng trước khi rút tiền');

      const currentBalance = Number(wallet.currentBalance ?? 0);
      if (amount > currentBalance)
        throw new InternalServerErrorException('Không đủ số dư');

      const withdrawalRequest = manager.getRepository(WithdrawalRequest).create({
        wallet: wallet,
        amount: amount,
        status: WithdrawalRequestStatus.PENDING,
      });
      await manager.getRepository('WithdrawalRequest').save(withdrawalRequest);

      // const newCurrent = currentBalance - amount;

      // wallet.currentBalance = newCurrent;
      // await manager.getRepository(Wallet).save(wallet);

      // const newTransaction = manager.getRepository(WalletTransaction).create({
      //   wallet: wallet,
      //   type: WalletTransactionType.DEBIT,
      //   amount: amount,
      // });
      // await manager.getRepository(WalletTransaction).save(newTransaction);

      await this.notificationService.sendNotificationToAdmins({
        body: `Người dùng ${wallet.user.fullName} đã tạo yêu cầu rút tiền số tiền ${amount}`,
        title: 'Yêu cầu rút tiền mới',
        type: NotificationType.INFO,
        navigateTo: '/wallets',
      })

      return new CustomApiResponse<void>(HttpStatus.OK, 'Rút tiền thành công');
    });
  }
  
  async approveWithdrawalRequest(withdrawalRequestId: number): Promise<void> {
    return await this.datasource.transaction(async (manager) => {
      const withdrawalRequest = await manager.getRepository(WithdrawalRequest).findOne({
        where: { id: withdrawalRequestId },
        relations: ['wallet'],
        withDeleted: false,
      });
      if (!withdrawalRequest) throw new InternalServerErrorException('Yêu cầu rút tiền không tồn tại');
      if (withdrawalRequest.status !== WithdrawalRequestStatus.PENDING) {
        throw new InternalServerErrorException('Yêu cầu rút tiền đã được xử lý');
      }
      
      const wallet = withdrawalRequest.wallet;
      const currentBalance = Number(wallet.currentBalance ?? 0);
      if (withdrawalRequest.amount > currentBalance) {
        throw new InternalServerErrorException('Không đủ số dư trong ví');
      }
      
      const newCurrent = currentBalance - withdrawalRequest.amount;
      wallet.currentBalance = newCurrent;
      await manager.getRepository(Wallet).save(wallet);
      withdrawalRequest.status = WithdrawalRequestStatus.APPROVED;
      await manager.getRepository(WithdrawalRequest).save(withdrawalRequest);
      
      const newTransaction = manager.getRepository(WalletTransaction).create({
        wallet: wallet,
        type: WalletTransactionType.DEBIT,
        amount: withdrawalRequest.amount,
      });
      await manager.getRepository(WalletTransaction).save(newTransaction);

      await this.notificationService.sendNotification({
        userId: wallet.user.id,
        title: 'Yêu cầu rút tiền của bạn đã được chấp thuận',
        body: `Yêu cầu rút tiền số tiền ${withdrawalRequest.amount} từ ví của bạn đã được chấp thuận.`,
        navigateTo: `/(learner)/wallet`,
        type: NotificationType.SUCCESS,
      });
    }
    );
  }

  async rejectWithdrawalRequest(withdrawalRequestId: number): Promise<void> {
    return await this.datasource.transaction(async (manager) => {
      const withdrawalRequest = await manager.getRepository(WithdrawalRequest).findOne({
        where: { id: withdrawalRequestId },
        withDeleted: false,
      });
      if (!withdrawalRequest) throw new InternalServerErrorException('Yêu cầu rút tiền không tồn tại');
      if (withdrawalRequest.status !== WithdrawalRequestStatus.PENDING) {
        throw new InternalServerErrorException('Yêu cầu rút tiền đã được xử lý');
      }
      
      withdrawalRequest.status = WithdrawalRequestStatus.REJECTED;
      await manager.getRepository(WithdrawalRequest).save(withdrawalRequest);

      const wallet = await manager.getRepository(Wallet).findOne({
        where: { id: withdrawalRequest.wallet.id },
        withDeleted: false,
      });
      if (!wallet) throw new InternalServerErrorException('Ví không tồn tại');

      await this.notificationService.sendNotification({
        userId: wallet.user.id,
        title: 'Yêu cầu rút tiền của bạn đã bị từ chối',
        body: `Yêu cầu rút tiền số tiền ${withdrawalRequest.amount} từ ví của bạn đã bị từ chối.`,
        navigateTo: `/(learner)/wallet`,
        type: NotificationType.ERROR,
      });
    }
    );
  }

  async handleWalletTopUp(userId: User['id'], amount: number,description?: string,session?: Session): Promise<void> {
    return await this.datasource.transaction(async (manager) => {
      const wallet = await manager.getRepository(Wallet).findOne({
        where: { user: { id: userId } },
        withDeleted: false,
      });
      if (!wallet) throw new InternalServerErrorException('Wallet not found');

      const currentBalance = Number(wallet.currentBalance ?? 0);
      const totalIncome = Number(wallet.totalIncome ?? 0);
      const newCurrent = currentBalance + Number(amount);
      const newTotal = totalIncome + Number(amount);

      wallet.currentBalance = newCurrent;
      wallet.totalIncome = newTotal;
      await manager.getRepository(Wallet).save(wallet);

      const newTransaction = manager.getRepository(WalletTransaction).create({
        wallet: wallet,
        type: WalletTransactionType.CREDIT,
        amount: amount,
        description: description,
        session: session,
      });
      await manager.getRepository(WalletTransaction).save(newTransaction);
    });
  }
}
