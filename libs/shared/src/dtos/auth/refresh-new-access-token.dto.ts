import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class RefreshNewAccessTokenDto {
  constructor(refreshToken: string) {
    this.refreshToken = refreshToken;
  }

  @ApiProperty({
    description: 'Refresh token to obtain a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  @IsNotEmpty({ message: 'Refresh token is required' })
  @Transform(({ value }) => {
    if (value.includes('; Path')) {
      return value.split('; Path')[0];
    }
    return value;
  })
  refreshToken: string;
}
