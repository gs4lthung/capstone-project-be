import { NestFactory } from '@nestjs/core';
import { VideoServiceModule } from './video-service.module';
import { CustomLogger } from '@app/shared/customs/custom-logger';
import { ConfigService } from '@app/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new CustomLogger({
    prefix: 'VIDEO',
  });

  const app = await NestFactory.create(VideoServiceModule, {
    logger,
  });

  const configService = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${configService.get('rabbitmq').username}:${configService.get('rabbitmq').password}@${configService.get('rabbitmq').host}:${configService.get('rabbitmq').port}/${configService.get('rabbitmq').username}`,
      ],
      queue: 'video_queue',
      queueOptions: {
        durable: configService.get('rabbitmq').durable,
        autoDelete: configService.get('rabbitmq').autoDelete,
      },
    },
  });

  await app.startAllMicroservices();

  logger.verbose(`Video Service is running on video_queue`);
}
bootstrap();
