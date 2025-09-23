import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { Field, ObjectType } from '@nestjs/graphql';
import { RoleDto } from '../roles/role.dto';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';
import { CoachProfileDto } from './coaches/coach.dto';
import { FcmTokenDto } from '../fcm-tokens/fcm-token.dto';

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

  @Field(() => CoachProfileDto, { nullable: true })
  coachProfile?: CoachProfileDto;
}

@ObjectType()
export class PaginatedUser extends PaginatedResource(UserDto) {}
