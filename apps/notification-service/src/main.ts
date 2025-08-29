import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { ConfigService } from '@app/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { InternalDisabledLogger } from '@app/shared/loggers/internal-disable.logger';

async function bootstrap() {
  const logger = new InternalDisabledLogger({
    prefix: 'NOTIFICATION',
  });

  const app = await NestFactory.create(NotificationServiceModule, {
    logger,
  });

  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${configService.get('rabbitmq').username}:${configService.get('rabbitmq').password}@${configService.get('rabbitmq').host}:${configService.get('rabbitmq').port}/${configService.get('rabbitmq').username}`,
      ],
      queue: 'notification_queue',
      queueOptions: {
        durable: configService.get('rabbitmq').durable,
        autoDelete: configService.get('rabbitmq').autoDelete,
      },
    },
  });

  await app.startAllMicroservices();

  logger.verbose(`Notification Service is running on notification_queue`);
}
bootstrap();
