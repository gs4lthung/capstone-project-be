import { GqlCustomDateTime } from '@app/shared/scalars/gql-custom-datetime.scalar';
import { Field, ObjectType } from '@nestjs/graphql';
import { RoleDto } from '../roles/role.dto';
import { FcmTokenDto } from '../fcm_tokens/fcm-token.dto';
import { OrderDto } from '../orders/order.dto';

@ObjectType()
export class UserDto {
  @Field(() => Number)
  id: number;

  @Field(() => String)
  fullName: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  profilePicture?: string;

  @Field(() => Boolean)
  isEmailVerified: boolean;

  @Field(() => GqlCustomDateTime)
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  updatedAt: Date;

  @Field(() => GqlCustomDateTime, { nullable: true })
  deletedAt: Date;

  @Field(() => RoleDto, { nullable: true })
  role: RoleDto;

  @Field(() => [FcmTokenDto], { nullable: true })
  fcmTokens: FcmTokenDto[];

  @Field(() => [OrderDto], { nullable: true })
  orders: OrderDto[];
}
