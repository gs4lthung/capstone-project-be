import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@app/config';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { CustomLogger } from '@app/shared/customs/custom-logger';

async function bootstrap() {
  const logger = new CustomLogger({
    prefix: 'API_GATEWAY',
  });

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(cookieParser());

  app.use(compression());

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            'https://cdn.jsdelivr.net',
            // Allow inline script for GraphQL Playground
            "'sha256-jy0ROHCLlkmrjNmmholpRXAJgTmhuirtXREXGa8VmVU='",
          ],
          imgSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
          connectSrc: ["'self'"], // Allow GraphQL endpoint
          styleSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"], // Allow styles
        },
      },
    }),
  );

  app.setGlobalPrefix(`api/${configService.get('app').version}`);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const errorMsg = errors.map((error) => {
          return Object.values(error.constraints || {}).join(', ');
        });
        return new CustomRpcException(
          errorMsg.join('; '),
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );

  if (configService.get('node_env') === 'dev')
    app.use(new LoggerMiddleware().use);

  const config = new DocumentBuilder()
    .setTitle(`${configService.get('app').name} API`)
    .setDescription(
      `API documentation for the ${configService.get('app').name}`,
    )
    .setVersion(configService.get('app').version)
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory(), {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(configService.get('api_gateway').port);

  logger.verbose(
    `API Gateway is running on port ${configService.get('api_gateway').port}`,
  );
}
bootstrap();
