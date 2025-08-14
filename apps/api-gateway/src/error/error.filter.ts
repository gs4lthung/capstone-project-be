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
import { I18nService } from 'nestjs-i18n';
import { CustomRpcException } from '@app/shared/exceptions/custom-rpc.exception';
import { RedisService } from '@app/redis';

@Catch()
export class ErrorLoggingFilter implements ExceptionFilter {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @InjectRepository(Error)
    private readonly errorRepository: Repository<Error>,
    private readonly i18nService: I18nService,
    private readonly redisService: RedisService,
  ) {}

  async catch(exception: CustomRpcException, host: ArgumentsHost) {
    const logger = new Logger(ErrorLoggingFilter.name);

    const contextType = ContextUtils.getRequestContextType(host.getType());
    const isDevelopment = this.configService.get('node_env') === 'dev';

    let response: Response;
    let request: CustomApiRequest;
    let requestUrl: string;

    // Handle different context types
    switch (contextType) {
      case ProtocolEnum.HTTP:
        const ctx = host.switchToHttp();
        response = ctx.getResponse<Response>();
        request = ctx.getRequest<CustomApiRequest>();
        requestUrl = request.url;
        break;
      case ProtocolEnum.GRAPHQL:
        const gqlCtx = GqlArgumentsHost.create(host);
        response = gqlCtx.getContext().res;
        request = gqlCtx.getContext().req;
        requestUrl = `${ProtocolEnum.GRAPHQL}`;
        break;
      case ProtocolEnum.WS:
        const wsCtx = host.switchToWs();
        response = wsCtx.getClient<Response>();
        request = wsCtx.getData<CustomApiRequest>();
        requestUrl = request.url || `/${ProtocolEnum.WS}`;
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

    // Store not found resource to Redis cache
    if (exception.statusCode === HttpStatus.NOT_FOUND && exception.stack) {
      const cacheKey = exception.stack.split(':')[0];
      const id = exception.stack.split(':')[1];

      await this.redisService.set(
        `${cacheKey}:${id}`,
        '__NULL__',
        this.configService.get('cache').negative_ttl,
      );
    }

    // Translate error message
    const i18nErrorMessage =
      this.i18nService.t(`errors.${exception.message}`, {
        lang: request.query?.lang || 'en',
      }) || exception.message;

    // Extract user information if available
    const user = request.user as User;
    let userId: number | null = null;
    if (user && 'id' in user) {
      userId = user.id;
    }

    // Check if the error is an aggregate error and log it out
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

    // Store error in database
    if (!isDevelopment) {
      const ERROR_MESSAGE_LENGTH = 4900;
      const errorEntity = this.errorRepository.create({
        code: String(exception.statusCode),
        message: exception.message,
        stack: isAggregateError
          ? exception.errors
              .map((err) => String(err))
              .join('\n')
              ?.slice(0, ERROR_MESSAGE_LENGTH)
          : exception.stack?.slice(0, ERROR_MESSAGE_LENGTH),
        url: requestUrl,
        body: request.body ? JSON.stringify(request.body) : null,
        user: userId ? { id: userId } : null,
      });

      await this.errorRepository.save(errorEntity);
    }

    // Response based on context types
    switch (contextType) {
      case ProtocolEnum.HTTP:
        const status = exception.statusCode;
        response.status(status).json({
          statusCode: status,
          message: i18nErrorMessage,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;
      case ProtocolEnum.GRAPHQL:
        throw new GraphQLError(i18nErrorMessage, {
          extensions: {
            code: exception.statusCode,
          },
        });
      case ProtocolEnum.WS:
        response.emit('exception', {
          message: i18nErrorMessage,
          code: exception.statusCode,
        });
        break;
      default:
        return;
    }
  }
}
