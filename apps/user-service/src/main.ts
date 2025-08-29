import { NestFactory } from '@nestjs/core';
import { UserServiceModule } from './user-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@app/config';
import { InternalDisabledLogger } from '@app/shared/loggers/internal-disable.logger';

async function bootstrap() {
  const logger = new InternalDisabledLogger({
    prefix: 'USER',
  });

  const app = await NestFactory.create(UserServiceModule, {
    logger,
  });

  const configService = app.get(ConfigService);

  const host = configService.get('user_service').host;
  const port = configService.get('user_service').port;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host,
      port,
    },
  });

  await app.startAllMicroservices();

  logger.verbose(`User Service is running on ${host}:${port}`);
}
bootstrap();
