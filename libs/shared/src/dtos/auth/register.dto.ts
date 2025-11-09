import { PickleballLevel } from '@app/shared/enums/pickleball.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  ValidateIf,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  ValidateNested,
} from 'class-validator';

export class CreateLearnerDto {
  @ApiProperty({
    description: 'Skill level of the learner',
    example: PickleballLevel.BEGINNER,
  })
  @IsNotEmpty({ message: 'Skill level is required' })
  @IsEnum(PickleballLevel)
  skillLevel: PickleballLevel;

  @ApiProperty({
    description: 'Learning goal of the learner',
    example: PickleballLevel.INTERMEDIATE,
  })
  @IsNotEmpty({ message: 'Learning goal is required' })
  @IsEnum(PickleballLevel)
  learningGoal: PickleballLevel;

  @ApiProperty({
    description: 'Province ID of the learner',
    example: 1,
  })
  @IsNotEmpty({ message: 'Province ID is required' })
  province: number;

  @ApiProperty({
    description: 'District ID of the learner',
    example: 10,
  })
  @IsNotEmpty({ message: 'District ID is required' })
  district: number;
}

export class RegisterRequestDto {
  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString({ message: 'Full name must be a string' })
  fullName: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
    required: false,
  })
  @ValidateIf((o) => o.email != null || !o.phoneNumber)
  @IsNotEmpty({ message: 'Email or phone is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+84123456789',
    required: false,
  })
  @ValidateIf((o) => o.phoneNumber != null || !o.email)
  @IsNotEmpty({ message: 'Email or phone is required' })
  @IsPhoneNumber('VN', {
    message: 'Phone number must be a valid Vietnamese phone number',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Password123@',
  })
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

  @IsNotEmpty({ each: true })
  @ValidateNested({ each: true })
  @Type(() => CreateLearnerDto)
  learner: CreateLearnerDto;
}

export class VerifyPhoneDto {
  @ApiProperty({
    description: 'The phone number of the user',
    example: '+84123456789',
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsPhoneNumber('VN', {
    message: 'Phone number must be a valid Vietnamese phone number',
  })
  phoneNumber: string;
  @ApiProperty({
    description: 'The verification code sent to the phone number',
    example: '123456',
  })
  @IsNotEmpty({ message: 'Verification code is required' })
  @IsString({ message: 'Verification code must be a string' })
  code: string;
}
