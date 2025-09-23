import { Field, ObjectType } from '@nestjs/graphql';

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
}
