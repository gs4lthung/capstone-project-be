import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@app/config';
import { InternalDisabledLogger } from '@app/shared/loggers/internal-disable.logger';

async function bootstrap() {
  const logger = new InternalDisabledLogger({
    prefix: 'AUTH',
  });

  const app = await NestFactory.create(AuthServiceModule, {
    logger,
  });

  const configService = app.get(ConfigService);

  const host = configService.get('auth_service').host;
  const port = configService.get('auth_service').port;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host,
      port,
    },
  });

  await app.startAllMicroservices();

  logger.verbose(`Auth Service is running on port ${port}`);
}
bootstrap();
