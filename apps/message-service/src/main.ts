import { NestFactory } from '@nestjs/core';
import { MessageServiceModule } from './message-service.module';
import { ConfigService } from '@app/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConsoleLogger, Logger } from '@nestjs/common';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(
    MessageServiceModule,
    { bufferLogs: true },
  );
  const configService = appContext.get(ConfigService);

  const host = configService.get('rabbitmq').host;
  const port = configService.get('rabbitmq').port;

  appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MessageServiceModule,
    {
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
      logger: new ConsoleLogger({
        prefix: 'MESSAGE',
      }),
    },
  );

  await app.listen();
  const logger = new Logger(MessageServiceModule.name);
  logger.log(`${MessageServiceModule.name} is running on ${host}:${port}`);
}
bootstrap();
