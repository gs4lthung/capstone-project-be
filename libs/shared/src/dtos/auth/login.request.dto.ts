import { User } from '@app/database/entities/user.entity';
import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';

export class LoginRequestDto extends PickType(User, [
  'email',
  'password',
] as const) {
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
