import { PaymentStatusEnum } from '@app/shared/enums/payment.enum';
import { GqlCustomDateTime } from '@app/shared/scalars/gql-custom-datetime.scalar';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OrderDto {
  @Field(() => Number)
  id: number;

  @Field(() => Number)
  orderCode: number;

  @Field(() => Number)
  amount: number;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  buyerName?: string;

  @Field(() => String, { nullable: true })
  buyerEmail?: string;

  @Field(() => String, { nullable: true })
  buyerAddress?: string;

  @Field(() => String)
  status: PaymentStatusEnum;

  @Field(() => GqlCustomDateTime, { nullable: true })
  expiredAt?: Date;

  @Field(() => GqlCustomDateTime)
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  updatedAt: Date;
}
