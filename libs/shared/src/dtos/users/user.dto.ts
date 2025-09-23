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

// Define allowed sort properties as a constant
export const USER_LIST_SORTABLE_FIELDS = [
  'id',
  'fullName',
  'email',
  'createdAt',
  'updatedAt',
] as const;

export type UserListSortableField = (typeof USER_LIST_SORTABLE_FIELDS)[number];

@ObjectType()
export class UserListDto extends UserDto {
  // Inherit all fields from UserDto
  // Only override or exclude fields that should be different
}

@ObjectType()
export class PaginatedUser extends PaginatedResource(UserDto) {}

@ObjectType()
export class PaginatedUserList extends PaginatedResource(UserListDto) {}
export interface UserListResponse {
  data: UserListDto[];
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}
