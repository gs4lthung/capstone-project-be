import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Inject,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Error } from '@app/database/entities/error.entity';
import { CustomRcpException } from '@app/shared/exceptions/custom-rcp.exception';
import { ConfigService } from '@app/config';
import { CustomApiRequest } from '@app/shared/requests/custom-api.request';

@Catch()
export class ErrorLoggingFilter implements ExceptionFilter {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @InjectRepository(Error)
    private readonly errorRepository: Repository<Error>,
  ) {}

  async catch(exception: CustomRcpException, host: ArgumentsHost) {
    const logger = new Logger(ErrorLoggingFilter.name);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<CustomApiRequest>();

    let userId: number | null = null;
    if (request.user && 'id' in request.user) {
      userId = request.user.id;
    }

    const isAggregateError = exception instanceof AggregateError;
    if (isAggregateError) {
      exception.errors.forEach((error) => {
        logger.error('Aggregate error', String(error));
      });
    } else {
      logger.error('Error details', exception.stack || exception.message);
    }

    if (this.configService.get('node_env') === 'dev') {
      const errorEntity = this.errorRepository.create({
        code: exception.statusCode
          ? String(exception.statusCode)
          : 'UNKNOWN_ERROR',
        message: exception.message || 'An unexpected error occurred',
        stack: isAggregateError
          ? exception.errors.map((err) => String(err)).join('\n')
          : exception.stack,
        url: request.url,
        body: request.body ? JSON.stringify(request.body) : null,
        user: userId ? { id: userId } : null,
      });

      await this.errorRepository.save(errorEntity);
    }

    const status = exception.statusCode || 500;
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
