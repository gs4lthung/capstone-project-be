import { User } from '@app/database/entities/user.entity';
import { PickType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class LoginDto extends PickType(User, ['email', 'password'] as const) {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be strong (at least 8 characters, 1 lowercase, 1 uppercase, 1 number, and 1 symbol)',
    },
  )
  password: string;
}
