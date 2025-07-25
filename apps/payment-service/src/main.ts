import { NestFactory } from '@nestjs/core';
import { PaymentServiceModule } from './payment-service.module';
import { ConfigService } from '@app/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from 'apps/api-gateway/src/app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const appContext =
    await NestFactory.createApplicationContext(PaymentServiceModule);
  const configService = appContext.get(ConfigService);

  const host = configService.get('rabbitmq').host;
  const port = configService.get('rabbitmq').port;

  appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${host}:${port}`],
        queue: 'payment_queue',
        queueOptions: {
          durable: true,
          autoDelete: false,
        },
      },
    },
  );

  await app.listen();
  const logger = new Logger('PaymentService');
  logger.log(`Payment Service is running on ${host}:${port}`);
}
bootstrap();
