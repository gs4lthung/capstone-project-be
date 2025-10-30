import { randomInt } from 'crypto';

export class CreatePaymentLinkRequestDto {
  orderCode: number = randomInt(1000, 9999);
  amount: number;
  description: string;
  expiredAt: Date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
}

export class CheckoutResponseDataType {
  code: string;
  id: string;
  cancel: 'true' | 'false';
  status:
    | 'PAID'
    | 'PENDING'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'UNDERPAID'
    | 'PROCESSING'
    | 'FAILED';
  orderCode: number;
}
