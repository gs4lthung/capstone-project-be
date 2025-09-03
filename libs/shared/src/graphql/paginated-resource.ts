import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';

export function PaginatedResource<T>(classRef: Type<T>): any {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => [classRef])
    items: T[];

    @Field(() => Int)
    total: number;

    @Field(() => Int)
    page: number;

    @Field(() => Int)
    pageSize: number;
  }
  return PaginatedType;
}
