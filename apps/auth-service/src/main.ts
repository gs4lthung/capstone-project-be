import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 8387,
      },
    },
  );

  await app.listen();
  const logger = new Logger('AuthService');
  logger.log('Auth Service is running on port 8387');
}
bootstrap();
