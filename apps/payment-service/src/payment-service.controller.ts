import { Controller } from '@nestjs/common';
import { PaymentServiceService } from './payment-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreatePaymentLinkRequestDto } from '@app/shared/dtos/payments/create-payment-link.dto';
import { CustomApiResponse } from '@app/shared/interfaces/responses/custom-api.response';
import { CheckoutResponseDataType } from '@payos/node/lib/type';

@Controller()
export class PaymentServiceController {
  constructor(private readonly paymentServiceService: PaymentServiceService) {}

  @MessagePattern({ cmd: 'create_payment_link' })
  async createPaymentLink({
    userId,
    data,
  }: {
    userId: number;
    data: CreatePaymentLinkRequestDto;
  }): Promise<CustomApiResponse<CheckoutResponseDataType>> {
    return this.paymentServiceService.createPaymentLink(userId, data);
  }
}
