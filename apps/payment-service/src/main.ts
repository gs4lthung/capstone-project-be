import { NestFactory } from '@nestjs/core';
import { PaymentServiceModule } from './payment-service.module';
import { ConfigService } from '@app/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConsoleLogger, Logger } from '@nestjs/common';

async function bootstrap() {
  const appContext =
    await NestFactory.createApplicationContext(PaymentServiceModule);
  const configService = appContext.get(ConfigService);

  const host = configService.get('rabbitmq').host;
  const port = configService.get('rabbitmq').port;

  appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${configService.get('rabbitmq').username}:${configService.get('rabbitmq').password}@${configService.get('rabbitmq').host}:${configService.get('rabbitmq').port}/${configService.get('rabbitmq').username}`,
        ],
        queue: 'payment_queue',
        queueOptions: {
          durable: configService.get('rabbitmq').durable,
          autoDelete: configService.get('rabbitmq').autoDelete,
        },
      },
      logger: new ConsoleLogger({
        prefix: 'PAYMENT',
      }),
    },
  );

  await app.listen();
  const logger = new Logger(PaymentServiceModule.name);
  logger.log(`${PaymentServiceModule.name} is running on ${host}:${port}`);
}
bootstrap();
