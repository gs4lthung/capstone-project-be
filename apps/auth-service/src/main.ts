import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@app/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(
    AuthServiceModule,
    { bufferLogs: true },
  );
  const configService = appContext.get(ConfigService);

  const host = configService.get('auth_service').host;
  const port = configService.get('auth_service').port;

  appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host,
        port,
      },
    },
  );

  await app.listen();
  const logger = new Logger('AuthService');
  logger.log(`Auth Service is running on ${host}:${port}`);
}
bootstrap();
