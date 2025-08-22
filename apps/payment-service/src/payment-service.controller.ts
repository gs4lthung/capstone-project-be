import { Controller } from '@nestjs/common';
import { PaymentServiceService } from './payment-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreatePaymentLinkDto } from '@app/shared/dtos/payments/create-payment-link.dto';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { CheckoutResponseDataType } from '@payos/node/lib/type';

@Controller()
export class PaymentServiceController {
  constructor(private readonly paymentServiceService: PaymentServiceService) {}

  @MessagePattern({ cmd: 'create_payment_link' })
  async createPaymentLink(
    @Payload()
    data: CreatePaymentLinkDto,
  ): Promise<CustomApiResponse<CheckoutResponseDataType>> {
    return this.paymentServiceService.createPaymentLink(data);
  }
}
