import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { ConfigService } from '@app/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(
    NotificationServiceModule,
  );
  const configService = appContext.get(ConfigService);

  const host = configService.get('rabbitmq').host;
  const port = configService.get('rabbitmq').port;

  appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationServiceModule,
    {
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
    },
  );

  await app.listen();
  const logger = new Logger('NotificationService');
  logger.log(`Notification Service is running on ${host}:${port}`);
}
bootstrap();
