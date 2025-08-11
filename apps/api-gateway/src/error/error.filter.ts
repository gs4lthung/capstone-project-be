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
import { ConfigService } from '@app/config';
import { CustomApiRequest } from '@app/shared/requests/custom-api.request';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { ContextUtils } from '@app/shared/utils/context.util';
import { ProtocolEnum } from '@app/shared/enums/protocol.enum';
import { User } from '@app/database/entities/user.entity';
import { I18nContext } from 'nestjs-i18n';
import { CustomRpcException } from '@app/shared/exceptions/custom-rpc.exception';

@Catch()
export class ErrorLoggingFilter implements ExceptionFilter {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @InjectRepository(Error)
    private readonly errorRepository: Repository<Error>,
  ) {}

  async catch(exception: CustomRpcException, host: ArgumentsHost) {
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
        code: String(exception.statusCode),
        message: exception.message,
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

    const i18nCtx = I18nContext.current(host);
    const i18nErrorMessage =
      i18nCtx.t(`messages.${exception.message}`) || i18nCtx.t('ERROR.UNKNOWN');
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
