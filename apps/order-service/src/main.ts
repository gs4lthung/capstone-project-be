import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order-service.module';
import { ConfigService } from '@app/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { InternalDisabledLogger } from '@app/shared/loggers/internal-disable.logger';

async function bootstrap() {
  const logger = new InternalDisabledLogger({
    prefix: 'ORDER',
  });

  const app = await NestFactory.create(OrderServiceModule, {
    logger,
  });

  const configService = app.get(ConfigService);

  const host = configService.get('order_service').host;
  const port = configService.get('order_service').port;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host,
      port,
    },
  });

  await app.startAllMicroservices();

  logger.verbose(`Order Service is running on ${host}:${port}`);
}
bootstrap();
