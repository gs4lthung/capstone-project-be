import { User } from '@app/database/entities/user.entity';
import { IsNotEmpty } from 'class-validator';

export class LoginResponseDto {
  constructor(
    accessToken: string,
    user: Pick<User, 'id' | 'fullName' | 'email'>,
  ) {
    this.accessToken = accessToken;
    this.user = user;
  }

  @IsNotEmpty({ message: 'Access token is required' })
  accessToken: string;

  @IsNotEmpty({ message: 'User information is required' })
  user: Pick<User, 'id' | 'fullName' | 'email'>;
}
