import { ArgsType, Field, Float } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ArgsType()
export class PaginatedGqlArgs {
  @Field(() => Float, { nullable: true, defaultValue: 1 })
  @Min(1)
  @Max(100)
  page?: number;

  @Field(() => Float, { nullable: true, defaultValue: 10 })
  @Min(1)
  @Max(100)
  size?: number;

  @Field(() => String, { nullable: true, defaultValue: '' })
  sort?: string;

  @Field(() => String, { nullable: true, defaultValue: 'ASC' })
  filter?: string;
}
