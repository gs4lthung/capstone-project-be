import { Role } from '@app/database/entities/role.entity';
import { User } from '@app/database/entities/user.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { PickType } from '@nestjs/mapped-types';

@ObjectType()
export class UserResponseDto extends PickType(User, [
  'id',
  'fullName',
  'email',
  'role',
]) {
  constructor(id: number, fullName: string, email: string, role: Role) {
    super();
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.roleName = role.name;
  }

  @Field(() => Number)
  id: number;

  @Field(() => String)
  fullName: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  roleName: string;
}
