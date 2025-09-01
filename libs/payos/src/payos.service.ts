import { ConfigService } from '@app/config';
import { Order } from '@app/database/entities/order.entity';
import { CreatePaymentLinkRequestDto } from '@app/shared/dtos/payments/create-payment-link.dto';
import { PaymentStatusEnum } from '@app/shared/enums/payment.enum';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { CryptoUtils } from '@app/shared/utils/crypto.util';
import { DateTimeUtils } from '@app/shared/utils/datetime.util';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import PayOS = require('@payos/node');
import {
  CheckoutResponseDataType,
  PaymentLinkDataType,
} from '@payos/node/lib/type';
import { Repository } from 'typeorm';
@Injectable()
export class PayosService {
  private logger = new Logger(PayosService.name);
  private returnUrl: string;
  private cancelUrl: string;
  private payOS: PayOS;
  constructor(
    private configService: ConfigService,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
  ) {
    this.payOS = new PayOS(
      this.configService.get('payos').client_id,
      this.configService.get('payos').api_key,
      this.configService.get('payos').checksum_key,
    );
    this.returnUrl = this.configService.get('payos').return_url;
    this.cancelUrl = this.configService.get('payos').cancel_url;
  }

  async createPaymentLink(
    data: CreatePaymentLinkRequestDto,
  ): Promise<CheckoutResponseDataType> {
    const orderId = data.orderId;
    try {
      if (!data.orderCode || !data.expiredAt || !data.orderId)
        throw new CustomRpcException(
          'Missing required fields',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      const expiredAtAsUnixTimestamp = DateTimeUtils.convertDateToUnixTimestamp(
        data.expiredAt as Date,
      );

      const secretKey = this.configService.get('payos').checksum_key;
      const dataToHash = `amount=${data.amount}&cancelUrl=${this.cancelUrl}&description=${data.description}&orderCode=${data.orderCode}&returnUrl=${this.returnUrl}`;

      const signature = CryptoUtils.generateHmacSignature(
        dataToHash,
        secretKey,
      );

      const payosData = {
        ...data,
        expiredAt: expiredAtAsUnixTimestamp,
        returnUrl: this.returnUrl,
        cancelUrl: this.cancelUrl,
        signature: signature,
      };
      delete payosData.orderId;

      const response = await this.payOS.createPaymentLink({
        ...payosData,
      });
      return response;
    } catch (error) {
      this.logger.error(error);
      await this.orderRepository.update(orderId, {
        status: PaymentStatusEnum.ERROR,
      });
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async getPaymentLinkInformation(
    orderCode: number,
  ): Promise<PaymentLinkDataType> {
    try {
      return await this.payOS.getPaymentLinkInformation(orderCode);
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
