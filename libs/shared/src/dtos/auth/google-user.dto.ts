import { IsNotEmpty } from 'class-validator';

export class GoogleUserDto {
  @IsNotEmpty({ message: 'ID is required' })
  id: string;

  @IsNotEmpty({ message: 'Email is required' })
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
  refreshToken: string;
}
