import { User } from '@app/database/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginResponseDto {
  constructor(
    accessToken: string,
    refreshToken: string,
    user: Pick<User, 'id' | 'fullName' | 'email'>,
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
  user: Pick<User, 'id' | 'fullName' | 'email'>;
}
