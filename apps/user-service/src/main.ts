import { NestFactory } from '@nestjs/core';
import { UserServiceModule } from './user-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@app/config';

async function bootstrap() {
  const appContext =
    await NestFactory.createApplicationContext(UserServiceModule);
  const configService = appContext.get(ConfigService);

  const host = configService.get('user_service').host;
  const port = configService.get('user_service').port;

  appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host,
        port,
      },
    },
  );
  await app.listen();
  const logger = new Logger('UserService');
  logger.log(`User Service is running on ${host}:${port}`);
}
bootstrap();
