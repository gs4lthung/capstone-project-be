import { ConfigService } from '@app/config';
import {
  CreatePaymentLinkRequestDto,
  CreatePayoutRequestDto,
} from '@app/shared/dtos/payments/payment.dto';
import { CryptoUtils } from '@app/shared/utils/crypto.util';
import { DateTimeUtils } from '@app/shared/utils/datetime.util';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { Injectable, Logger } from '@nestjs/common';
import { CreatePaymentLinkResponse, PaymentLink, PayOS } from '@payos/node';

@Injectable()
export class PayosService {
  private logger = new Logger(PayosService.name);
  private returnUrl: string;
  private cancelUrl: string;
  private payOS: PayOS;
  constructor(private configService: ConfigService) {
    this.payOS = new PayOS({
      clientId: this.configService.get('payos').client_id,
      apiKey: this.configService.get('payos').api_key,
      checksumKey: this.configService.get('payos').checksum_key,
    });
    this.returnUrl = this.configService.get('payos').return_url;
    this.cancelUrl = this.configService.get('payos').cancel_url;
  }

  async createPaymentLink(
    data: CreatePaymentLinkRequestDto,
  ): Promise<CreatePaymentLinkResponse> {
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

      const response = await this.payOS.paymentRequests.create({
        ...payosData,
      });
      this.logger.log('PayOS response:', response);
      return response;
    } catch (error) {
      this.logger.error(error);
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async getPaymentLinkInformation(orderCode: number): Promise<PaymentLink> {
    try {
      return await this.payOS.paymentRequests.get(orderCode);
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async confirmWebhook(url: string): Promise<void> {
    try {
      const response = await this.payOS.webhooks.confirm(url);
      console.log('Webhook confirmed:', response);
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async payoutToBank(data: CreatePayoutRequestDto) {
    try {
      const response = await this.payOS.payouts.create({
        referenceId: this.payOS.checksumKey + Date.now().toString(),
        ...data,
      });
      console.log('Payout response:', response);
      return response;
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
