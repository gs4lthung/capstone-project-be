import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@app/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CustomLogger } from '@app/shared/customs/custom-logger';
import { ChatServiceModule } from './chat-service.module';

async function bootstrap() {
  const logger = new CustomLogger({
    prefix: 'CHAT',
  });

  const app = await NestFactory.create(ChatServiceModule, {
    logger,
  });

  const configService = app.get(ConfigService);

  const host = configService.get('chat_service').host;
  const port = configService.get('chat_service').port;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host,
      port,
    },
  });

  await app.startAllMicroservices();

  logger.verbose(`${ChatServiceModule.name} is running on ${host}:${port}`);
}
bootstrap();
