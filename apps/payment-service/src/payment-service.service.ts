import { Order } from '@app/database/entities/order.entity';
import { PayosService } from '@app/payos';
import { CreatePaymentLinkDto } from '@app/shared/dtos/payments/create-payment-link.dto';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { CryptoUtils } from '@app/shared/utils/crypto.util';
import { DateTimeUtils } from '@app/shared/utils/datetime.util';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckoutResponseDataType } from '@payos/node/lib/type';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentServiceService {
  private logger = new Logger(PaymentServiceService.name);
  private readonly MIN_ORDER_CODE = 100_000_000;
  private readonly MAX_ORDER_CODE = 999_999_999;
  private readonly ORDER_EXPIRED_TIME =
    DateTimeUtils.getCurrentUnixTimestamp() + 1 * 60 * 30; // 30 minutes
  constructor(
    private readonly payOsService: PayosService,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
  ) {}

  async createPaymentLink(
    data: CreatePaymentLinkDto,
  ): Promise<CustomApiResponse<CheckoutResponseDataType>> {
    let savedOrder: Order;
    try {
      const orderCode = CryptoUtils.generateRandomNumber(
        this.MIN_ORDER_CODE,
        this.MAX_ORDER_CODE,
      );

      const orderData = {
        ...data,
        orderCode: orderCode,
        expiredAt: DateTimeUtils.convertUnixTimestampToDate(
          this.ORDER_EXPIRED_TIME,
        ),
      };

      savedOrder = this.orderRepository.create(orderData);
      await this.orderRepository.save(savedOrder);

      return new CustomApiResponse<CheckoutResponseDataType>(
        HttpStatus.CREATED,
        'PAYMENT.CREATE_LINK_SUCCESS',
        await this.payOsService.createPaymentLink({
          ...orderData,
          orderId: savedOrder.id,
        }),
      );
    } catch (error) {
      this.logger.error(error);
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
