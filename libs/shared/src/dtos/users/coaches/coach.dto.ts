import { CoachCredentialStatus } from '@app/shared/enums/coach.enum';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { Field, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

@ObjectType()
export class CoachProfileDto {
  @Field(() => Number)
  id: number;

  @Field(() => String)
  bio: string;

  @Field(() => String)
  specialties: string;

  @Field(() => Number)
  basePrice: number;

  @Field(() => String)
  verificationStatus: string;

  @Field(() => GqlCustomDateTime)
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  updatedAt: Date;

  @Field(() => [CoachCredentialDto], { nullable: true })
  credentials?: CoachCredentialDto[];

  @Field(() => [CoachPackageDto], { nullable: true })
  packages?: CoachPackageDto[];
}

@ObjectType()
export class CoachCredentialDto {
  @Field(() => Number)
  id: number;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  issuedBy?: string;

  @Field(() => GqlCustomDateTime, { nullable: true })
  issueDate?: Date;

  @Field(() => String, { nullable: true })
  credentialUrl?: string;

  @Field(() => String)
  status: CoachCredentialStatus;

  @Field(() => GqlCustomDateTime)
  updatedAt: Date;
}
@ObjectType()
export class CoachPackageDto {
  @Field(() => Number)
  id: number;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Number)
  totalSessions: number;

  @Field(() => Number)
  sessionDurationMin: number;

  @Field(() => Number)
  price: number;

  @Field(() => String)
  status: string;

  @Field(() => GqlCustomDateTime)
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  updatedAt: Date;
}

export class CreateCoachProfileDto {
  @ApiProperty({
    example:
      'Experienced fitness coach with a passion for helping clients achieve their goals.',
    description: 'A brief biography of the coach',
  })
  @IsNotEmpty()
  @IsString()
  bio: string;

  @ApiProperty({
    example: 'Yoga, Pilates, Strength Training',
    description: 'Specialties of the coach',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  specialties: string;

  @ApiProperty({
    example: 50,
    description: 'Base price for coaching sessions',
  })
  @IsNotEmpty()
  basePrice: number;

  credentials: CreateCoachProfileCredentialDto[];
}
class CreateCoachProfileCredentialDto {
  @ApiProperty({
    example: 'Certified Personal Trainer',
    description: 'Title of the credential',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: 'National Academy of Sports Medicine',
    description: 'Issuing organization of the credential',
  })
  @IsString()
  @MaxLength(50)
  issuedBy?: string;

  @ApiProperty({
    example: '2022-05-20',
    description: 'Issue date of the credential',
  })
  @IsDate()
  issueDate?: Date;

  @ApiProperty({
    example: '2024-05-20',
    description: 'Expiration date of the credential',
  })
  @IsDate()
  expirationDate?: Date;
  @IsString()
  @MaxLength(255)
  credentialUrl?: string;
}

export class UpdateCoachProfileDto {
  @IsNotEmpty()
  id: number;
  bio: string;
  specialties: string;
  basePrice: number;
  credentials: UpdateCoachProfileCredentialDto[];

  constructor(partial: Partial<UpdateCoachProfileDto>) {
    Object.assign(this, partial);
  }
}

class UpdateCoachProfileCredentialDto {
  id: number;
  title: string;
  issuedBy?: string;
  issueDate?: Date;
  expirationDate?: Date;
  credentialUrl?: string;

  constructor(partial: Partial<UpdateCoachProfileCredentialDto>) {
    Object.assign(this, partial);
  }
}

export class VerifyCoachProfileDto {
  @IsNotEmpty()
  id: number;

  credentials: VerifyCoachProfileCredentialDto[];

  constructor(partial: Partial<VerifyCoachProfileDto>) {
    Object.assign(this, partial);
  }
}

class VerifyCoachProfileCredentialDto {
  @IsNotEmpty()
  id: number;

  @IsEnum(CoachCredentialStatus)
  status: CoachCredentialStatus;

  constructor(partial: Partial<VerifyCoachProfileCredentialDto>) {
    Object.assign(this, partial);
  }
}

export class CreateCoachPackageDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  description?: string;

  @IsNotEmpty()
  totalSessions: number;

  @IsNotEmpty()
  sessionDurationMin: number;

  @IsNotEmpty()
  price: number;

  constructor(partial: Partial<CreateCoachPackageDto>) {
    Object.assign(this, partial);
  }
}
