import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/scalars/gql-custom-datetime.scalar';

@ObjectType()
export class FcmTokenDto {
  @Field(() => Number)
  id: number;

  @Field(() => String)
  token: string;

  @Field(() => String)
  deviceType: 'android' | 'ios' | 'web';

  @Field(() => String, { nullable: true })
  browser?: string;

  @Field(() => String, { nullable: true })
  platform?: string;

  @Field(() => GqlCustomDateTime)
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  lastSeenAt: Date;
}
