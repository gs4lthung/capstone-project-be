import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@app/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CustomLogger } from '@app/shared/customs/custom-logger';
import { ChatServiceModule } from './chat-service.module';

async function bootstrap() {
  const logger = new CustomLogger({
    prefix: 'CHAT',
  });

  const app = await NestFactory.create(ChatServiceModule, {
    logger,
  });

  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${configService.get('rabbitmq').username}:${configService.get('rabbitmq').password}@${configService.get('rabbitmq').host}:${configService.get('rabbitmq').port}/${configService.get('rabbitmq').username}`,
      ],
      queue: 'chat_queue',
      queueOptions: {
        durable: configService.get('rabbitmq').durable,
        autoDelete: configService.get('rabbitmq').autoDelete,
      },
    },
  });

  await app.startAllMicroservices();

  logger.verbose(`Chat Service is running on chat_queue`);
}
bootstrap();
