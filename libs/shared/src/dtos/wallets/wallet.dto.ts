import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({
    description: 'ID of the bank associated with the wallet',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  bankId: number;

  @ApiProperty({
    description: 'Bank account number associated with the wallet',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  bankAccountNumber: string;
}
