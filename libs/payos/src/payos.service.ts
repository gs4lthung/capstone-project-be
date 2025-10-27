import { ConfigService } from '@app/config';
import { CreatePaymentLinkRequestDto } from '@app/shared/dtos/payments/payment.dto';
import { CryptoUtils } from '@app/shared/utils/crypto.util';
import { DateTimeUtils } from '@app/shared/utils/datetime.util';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import PayOS = require('@payos/node');
import {
  CheckoutResponseDataType,
  PaymentLinkDataType,
} from '@payos/node/lib/type';
@Injectable()
export class PayosService {
  private logger = new Logger(PayosService.name);
  private returnUrl: string;
  private cancelUrl: string;
  private payOS: PayOS;
  constructor(private configService: ConfigService) {
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
    try {
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

      const response = await this.payOS.createPaymentLink({
        ...payosData,
      });
      this.logger.log('PayOS response:', response);
      return response;
    } catch (error) {
      this.logger.error(error);
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

  async confirmWebhook(url: string): Promise<void> {
    try {
      await this.payOS.confirmWebhook(url);
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
