import { AuthUtils } from '@app/shared/utils/auth.util';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { parse, print } from 'graphql';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const logger = new Logger(LoggerMiddleware.name);
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const userId = AuthUtils.extractTokenFromHeader(req);
      const isGraphQLRequest = req.originalUrl.includes('/graphql');

      const logMessage = `${isGraphQLRequest ? 'GraphQL' : 'HTTP'} ${req.method} ${req.url} ${res.statusCode} ${req.ip} ${req.httpVersion} ${duration}ms ${req.get('User-Agent')} - User: ${userId}`;
      logger.log(logMessage);
      if (req.body) {
        logger.log(
          isGraphQLRequest
            ? null //print(parse(req.body.query))
            : JSON.stringify(req.body),
        );
      }
    });

    next();
  }
}
