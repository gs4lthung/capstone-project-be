import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RoleDto {
  @Field(() => Number)
  id: number;

  @Field(() => String)
  name: string;
}
