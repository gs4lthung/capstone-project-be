import { User } from '@app/database/entities/user.entity';
import { PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class LoginRequestDto extends PickType(User, [
  'email',
  'phoneNumber',
  'password',
] as const) {
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+84123456789',
  })
  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Invalid phone number format' })
  phoneNumber?: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Password123#',
  })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class LoginResponseDto {
  constructor(
    accessToken: string,
    refreshToken: string,
    user: Pick<
      User,
      'id' | 'fullName' | 'email' | 'phoneNumber' | 'role' | 'learner' | 'coach'
    >,
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }

  @ApiProperty({
    description: 'JWT access token for the user',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  @IsNotEmpty({ message: 'Access token is required' })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token for the user',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;

  @ApiProperty({
    description: 'Information about the authenticated user',
    type: User,
    example: {
      id: 'user-id',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
    },
    required: true,
  })
  @IsNotEmpty({ message: 'User information is required' })
  user: Pick<
    User,
    'id' | 'fullName' | 'email' | 'phoneNumber' | 'role' | 'learner' | 'coach'
  >;
}

export class CurrentUserResponseDto {
  constructor(
    user: Pick<
      User,
      'id' | 'fullName' | 'email' | 'phoneNumber' | 'role' | 'learner' | 'coach'
    >,
  ) {
    this.user = user;
  }

  @ApiProperty({
    description: 'Information about the authenticated user',
    type: User,
    example: {},
    required: true,
  })
  @IsNotEmpty({ message: 'User information is required' })
  user: Pick<
    User,
    'id' | 'fullName' | 'email' | 'phoneNumber' | 'role' | 'learner' | 'coach'
  >;
}
