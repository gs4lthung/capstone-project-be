import { ApiProperty } from '@nestjs/swagger';
import { CheckoutRequestType } from '@payos/node/lib/type';

export class CreatePaymentLinkRequestDto
  implements
    Omit<
      CheckoutRequestType,
      'returnUrl' | 'cancelUrl' | 'signature' | 'expiredAt'
    >
{
  orderId?: number;

  orderCode: number | null;

  expiredAt?: Date | number | null;

  @ApiProperty({
    description: 'The total amount for the payment',
    example: 1000,
    required: true,
  })
  amount: number;

  @ApiProperty({
    description: 'Description of the payment',
    example: 'Payment for order #12345',
    required: true,
  })
  description: string;

  @ApiProperty({
    description: 'List of items',
    example: [
      {
        name: 'Name',
        quantity: 1,
        price: 1000,
      },
    ],
    required: false,
  })
  items?: { name: string; quantity: number; price: number }[];

  @ApiProperty({
    description: 'Name of the buyer',
    example: 'John Doe',
    required: false,
  })
  buyerName?: string;

  @ApiProperty({
    description: 'Email of the buyer',
    example: 'john.doe@example.com',
    required: false,
  })
  buyerEmail?: string;

  @ApiProperty({
    description: 'Phone number of the buyer',
    example: '+1234567890',
    required: false,
  })
  buyerPhone?: string;

  @ApiProperty({
    description: 'Address of the buyer',
    example: '123 Main St, Anytown, USA',
    required: false,
  })
  buyerAddress?: string;
}
