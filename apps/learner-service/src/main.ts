import { NestFactory } from '@nestjs/core';
import { LearnerServiceModule } from './learner-service.module';
import { CustomLogger } from '@app/shared/customs/custom-logger';
import { ConfigService } from '@app/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new CustomLogger({
    prefix: 'LEARNER',
  });

  const app = await NestFactory.create(LearnerServiceModule, {
    logger,
  });

  const configService = app.get(ConfigService);

  const host = configService.get('learner_service').host;
  const port = configService.get('learner_service').port;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host,
      port,
    },
  });

  await app.startAllMicroservices();

  logger.verbose(`Learner Service is running on ${host}:${port}`);
}
bootstrap();
