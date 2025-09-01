import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLObjectType } from 'graphql';

@ObjectType()
export class PaginatedResource<T> {
  @Field(() => [GraphQLObjectType])
  items: T[];

  @Field(() => Number)
  total: number;

  @Field(() => Number)
  page: number;

  @Field(() => Number)
  pageSize: number;
}
