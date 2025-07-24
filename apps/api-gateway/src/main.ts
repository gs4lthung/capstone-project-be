import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@app/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // credentials: true,
  });

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
          connectSrc: ["'self'", 'http://localhost:3000'], // Allow GraphQL endpoint
          styleSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"], // Allow styles
        },
      },
    }),
  );
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('LMS System API')
    .setDescription('API documentation for the LMS System')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory());

  await app.listen(configService.get('api_gateway').port);
}
bootstrap();
