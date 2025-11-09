import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { ConfigModule, ConfigService } from '@app/config';
import { TwilioModule as BaseTwilioModule } from 'nestjs-twilio';

@Module({
  imports: [
    ConfigModule,
    BaseTwilioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        accountSid: config.get('twilio').accountSid,
        authToken: config.get('twilio').authToken,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
