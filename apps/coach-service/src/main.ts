import { NestFactory } from '@nestjs/core';
import { CoachServiceModule } from './coach-service.module';
import { CustomLogger } from '@app/shared/customs/custom-logger';
import { ConfigService } from '@app/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new CustomLogger({
    prefix: 'COACH',
  });

  const app = await NestFactory.create(CoachServiceModule, {
    logger,
  });

  const configService = app.get(ConfigService);

  const host = configService.get('coach_service').host;
  const port = configService.get('coach_service').port;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host,
      port,
    },
  });

  await app.startAllMicroservices();

  logger.verbose(`Coach Service is running on ${host}:${port}`);
}
bootstrap();
