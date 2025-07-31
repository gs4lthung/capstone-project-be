import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RegisterFcmTokenDto {
  @ApiProperty({
    description: 'The FCM token',
    example: 'fcm_token_12345',
  })
  @IsNotEmpty({ message: 'Token is required' })
  token: string;

  @ApiProperty({
    description: 'The device type',
    example: 'android',
  })
  @IsNotEmpty({ message: 'Device type is required' })
  deviceType: 'android' | 'ios' | 'web';
  @ApiProperty({
    description: 'The browser name (optional)',
    example: 'Chrome',
    required: false,
  })
  browser?: string;
  @ApiProperty({
    description: 'The platform name (optional)',
    example: 'Android',
    required: false,
  })
  platform?: string;

  constructor(
    token: string,
    deviceType: 'android' | 'ios' | 'web',
    browser?: string,
    platform?: string,
  ) {
    this.token = token;
    this.deviceType = deviceType;
    this.browser = browser;
    this.platform = platform;
  }
}
