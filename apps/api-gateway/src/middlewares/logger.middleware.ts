import { AuthUtils } from '@app/shared/utils/auth.util';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: any, next: (error?: Error | any) => void) {
    const logger = new Logger(LoggerMiddleware.name);
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const userId = AuthUtils.extractTokenFromHeader(req);
      const logMessage = `${req.method} ${req.url} ${res.statusCode} ${req.ip} ${req.httpVersion} ${duration}ms ${req.get('User-Agent')} - User: ${userId}`;
      logger.log(logMessage);
      if (req.body) {
        logger.log('Request Body:', req.body);
      }
    });

    next();
  }
}
