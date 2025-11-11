import { ConfigService } from '@app/config';
import { Injectable } from '@nestjs/common';
import { TwilioService as BaseTwilioService } from 'nestjs-twilio';

@Injectable()
export class TwilioService {
  constructor(
    private readonly twilioService: BaseTwilioService,
    private configService: ConfigService,
  ) {}

  async sendSMS(to: string) {
    return this.twilioService.client.verify
      .services(this.configService.get('twilio').verifyServiceSid)
      .verifications.create({
        to: to,
        channel: 'sms',
      });
  }

  async verifyPhoneNumber(phoneNumber: string, code: string) {
    return this.twilioService.client.verify
      .services(this.configService.get('twilio').verifyServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: code,
      });
  }
}
