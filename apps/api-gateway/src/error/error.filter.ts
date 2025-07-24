import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Error } from '@app/database/entities/error.entity';
import { ConfigService } from '@app/config';
import { CustomApiRequest } from '@app/shared/requests/custom-api.request';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { ContextUtils } from '@app/shared/utils/context.util';
import { ProtocolEnum } from '@app/shared/enums/protocol.enum';

@Catch()
export class ErrorLoggingFilter implements ExceptionFilter {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @InjectRepository(Error)
    private readonly errorRepository: Repository<Error>,
  ) {}

  async catch(exception: any, host: ArgumentsHost) {
    const logger = new Logger(ErrorLoggingFilter.name);

    const contextType = ContextUtils.getRequestContextType(host.getType());

    let response: Response;
    let request: CustomApiRequest;

    switch (contextType) {
      case ProtocolEnum.HTTP:
        const ctx = host.switchToHttp();
        response = ctx.getResponse<Response>();
        request = ctx.getRequest<CustomApiRequest>();
        break;
      case ProtocolEnum.GRAPHQL:
        const gqlCtx = GqlArgumentsHost.create(host);
        response = gqlCtx.getContext().res;
        request = gqlCtx.getContext().req;
    }

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
      let url = '';
      switch (contextType) {
        case ProtocolEnum.HTTP:
          url = request.url;
          break;
        case ProtocolEnum.GRAPHQL:
          url = '/graphql';
          break;
      }

      const errorEntity = this.errorRepository.create({
        code: exception.statusCode
          ? String(exception.statusCode)
          : 'UNKNOWN_ERROR',
        message: exception.message || 'An unexpected error occurred',
        stack: isAggregateError
          ? exception.errors
              .map((err) => String(err))
              .join('\n')
              ?.slice(0, 5000)
          : exception.stack?.slice(0, 5000),
        url: url,
        body: request.body ? JSON.stringify(request.body) : null,
        user: userId ? { id: userId } : null,
      });

      await this.errorRepository.save(errorEntity);
    }

    switch (contextType) {
      case ProtocolEnum.HTTP:
        const status = exception.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
        response.status(status).json({
          statusCode: status,
          message: exception.message || 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;
      case ProtocolEnum.GRAPHQL:
        throw new GraphQLError(
          exception.message || 'An unexpected error occurred',
          {
            extensions: {
              code:
                exception.statusCode &&
                exception.statusCode === HttpStatus.UNAUTHORIZED
                  ? 'UNAUTHENTICATED'
                  : exception.statusCode &&
                      exception.statusCode === HttpStatus.FORBIDDEN
                    ? 'FORBIDDEN'
                    : 'INTERNAL_SERVER_ERROR',
              originalError: exception,
            },
          },
        );
        break;
    }
  }
}
