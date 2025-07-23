import { User } from '@app/database/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginResponseDto {
  constructor(
    accessToken: string,
    user: Pick<User, 'id' | 'fullName' | 'email'>,
  ) {
    this.accessToken = accessToken;
    this.user = user;
  }

  @ApiProperty({
    description: 'JWT access token for the user',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'Access token is required' })
  accessToken: string;

  @ApiProperty({
    description: 'Information about the authenticated user',
    type: User,
    example: {
      id: 'user-id',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
    },
  })
  @IsNotEmpty({ message: 'User information is required' })
  user: Pick<User, 'id' | 'fullName' | 'email'>;
}
