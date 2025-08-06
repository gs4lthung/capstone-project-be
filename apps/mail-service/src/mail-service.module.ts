import { Module } from '@nestjs/common';
import { MailServiceController } from './mail-service.controller';
import { MailServiceService } from './mail-service.service';
import { ConfigModule, ConfigService } from '@app/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('mail').host,
          port: configService.get('mail').port,
          secure: configService.get('mail').secure,
          auth: {
            user: configService.get('mail').user,
            pass: configService.get('mail').pass,
          },
        },
        defaults: {
          from: `"No Reply" <Hello>`,
        },
        template: {
          dir: __dirname + '/src/templates',
          adapter: new HandlebarsAdapter(undefined, {
            inlineCssEnabled: true,
          }),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [MailServiceController],
  providers: [MailServiceService],
})
export class MailServiceModule {}
