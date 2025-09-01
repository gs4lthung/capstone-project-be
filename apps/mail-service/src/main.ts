import { NestFactory } from '@nestjs/core';
import { MailServiceModule } from './mail-service.module';
import { ConfigService } from '@app/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CustomLogger } from '@app/shared/customs/custom-logger';

async function bootstrap() {
  const logger = new CustomLogger({
    prefix: 'MAIL',
  });

  const app = await NestFactory.create(MailServiceModule, {
    logger,
  });

  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${configService.get('rabbitmq').username}:${configService.get('rabbitmq').password}@${configService.get('rabbitmq').host}:${configService.get('rabbitmq').port}/${configService.get('rabbitmq').username}`,
      ],
      queue: 'mail_queue',
      queueOptions: {
        durable: configService.get('rabbitmq').durable,
        autoDelete: configService.get('rabbitmq').autoDelete,
      },
    },
  });

  await app.startAllMicroservices();

  logger.verbose(`Mail Service is running on mail_queue`);
}
bootstrap();
