import { NestFactory } from '@nestjs/core';
import { MailServiceModule } from './mail-service.module';
import { ConfigService } from '@app/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const appContext =
    await NestFactory.createApplicationContext(MailServiceModule);
  const configService = appContext.get(ConfigService);

  const host = configService.get('rabbitmq').host;
  const port = configService.get('rabbitmq').port;

  appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MailServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${host}:${port}`],
        queue: 'mail_queue',
        queueOptions: {
          durable: configService.get('rabbitmq').durable,
          autoDelete: configService.get('rabbitmq').autoDelete,
        },
      },
    },
  );

  await app.listen();
  const logger = new Logger('MailService');
  logger.log(`Mail Service is running on ${host}:${port}`);
}
bootstrap();
