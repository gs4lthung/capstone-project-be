import { Injectable } from '@nestjs/common';
import { TwilioService as BaseTwilioService } from 'nestjs-twilio';

@Injectable()
export class TwilioService {
  constructor(private readonly twilioService: BaseTwilioService) {}
  async sendSMS(to: string, body: string) {
    return this.twilioService.client.messages.create({
      to,
      from: process.env.TWILIO_FROM_NUMBER,
      body,
    });
  }
}
