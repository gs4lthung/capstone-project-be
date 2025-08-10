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
import { User } from '@app/database/entities/user.entity';

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
    const isDevelopment = this.configService.get('node_env') === 'dev';

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
        break;
      case ProtocolEnum.WS:
        const wsCtx = host.switchToWs();
        response = wsCtx.getClient<Response>();
        request = wsCtx.getData<CustomApiRequest>();
        break;
      default:
        logger.error('Unsupported context type:', contextType);
        if (isDevelopment) {
          const error = this.errorRepository.create({
            code: 'UNSUPPORTED_CONTEXT_TYPE',
            message: `Unsupported context type: ${contextType}`,
            stack: exception.stack,
          });
          await this.errorRepository.save(error);
        }
        return;
    }

    const user = request.user as User;
    let userId: number | null = null;
    if (user && 'id' in user) {
      userId = user.id;
    }

    const isAggregateError = exception instanceof AggregateError;
    if (isAggregateError) {
      exception.errors.forEach((error) => {
        logger.error('Aggregate error', String(error));
      });
    } else {
      logger.error(
        'Error details',
        exception || exception.stack || exception.message,
      );
    }

    if (!isDevelopment) {
      let url = '';
      switch (contextType) {
        case ProtocolEnum.HTTP:
          url = request.url;
          break;
        case ProtocolEnum.GRAPHQL:
          url = `/${ProtocolEnum.GRAPHQL}`;
          break;
        case ProtocolEnum.WS:
          url = request.url || `/${ProtocolEnum.WS}`;
          break;
        default:
          url = 'Unknown URL';
          break;
      }

      const errorEntity = this.errorRepository.create({
        code:
          exception.statusCode || exception.status
            ? String(exception.statusCode || exception.status)
            : 'UNKNOWN_ERROR',
        message:
          exception.response?.message ||
          exception.message?.slice(0, 254) ||
          'An unexpected error occurred',
        stack: isAggregateError
          ? exception.errors
              .map((err) => String(err))
              .join('\n')
              ?.slice(0, 4999)
          : exception.stack?.slice(0, 4999),
        url: url,
        body: request.body ? JSON.stringify(request.body) : null,
        user: userId ? { id: userId } : null,
      });

      await this.errorRepository.save(errorEntity);
    }

    switch (contextType) {
      case ProtocolEnum.HTTP:
        const status =
          exception.statusCode ||
          exception.status ||
          HttpStatus.INTERNAL_SERVER_ERROR;
        response.status(status).json({
          statusCode: status,
          message:
            status === HttpStatus.INTERNAL_SERVER_ERROR
              ? 'Internal Server Error'
              : exception.response?.message ||
                exception.message ||
                'An unexpected error occurred',
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;
      case ProtocolEnum.GRAPHQL:
        throw new GraphQLError(
          exception.response.message ||
            exception.message ||
            'An unexpected error occurred',
          {
            extensions: {
              code:
                exception.statusCode ||
                exception.status ||
                HttpStatus.INTERNAL_SERVER_ERROR,
            },
          },
        );
      case ProtocolEnum.WS:
        response.emit('exception', {
          message:
            exception.response.message ||
            exception.message ||
            'An unexpected error occurred',
          code:
            exception.statusCode ||
            exception.status ||
            HttpStatus.INTERNAL_SERVER_ERROR,
        });
        break;
      default:
        return;
    }
  }
}
