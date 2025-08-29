import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order-service.module';
import { ConfigService } from '@app/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConsoleLogger, Logger } from '@nestjs/common';

async function bootstrap() {
  const appContext =
    await NestFactory.createApplicationContext(OrderServiceModule);
  const configService = appContext.get(ConfigService);

  const host = configService.get('order_service').host;
  const port = configService.get('order_service').port;

  appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host,
        port,
      },
      logger: new ConsoleLogger({
        prefix: 'ORDER',
      }),
    },
  );
  await app.listen();
  const logger = new Logger(OrderServiceModule.name);
  logger.log(`${OrderServiceModule.name} is running on ${host}:${port}`);
}
bootstrap();
