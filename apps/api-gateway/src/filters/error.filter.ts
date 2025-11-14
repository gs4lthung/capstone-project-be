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
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { ContextUtils } from '@app/shared/utils/context.util';
import { ProtocolEnum } from '@app/shared/enums/protocol.enum';
import { User } from '@app/database/entities/user.entity';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';

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
    let requestUrl: string;

    // Handle different context types
    switch (contextType) {
      case ProtocolEnum.HTTP:
        const ctx = host.switchToHttp();
        response = ctx.getResponse<Response>();
        request = ctx.getRequest<CustomApiRequest>();
        requestUrl = request.url;
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

    const message =
      exception.message ||
      (exception as any).response?.message ||
      'INTERNAL_SERVER_ERROR';
    const statusCode =
      exception.statusCode ||
      (exception as any).response?.statusCode ||
      HttpStatus.INTERNAL_SERVER_ERROR;
    const stack = exception.stack;
    const responseMessage =
      statusCode === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'INTERNAL_SERVER_ERROR'
        : message;

    // Check if the error is an aggregate error and log it out
    const isAggregateError = exception instanceof AggregateError;
    if (isAggregateError) {
      exception.errors.forEach((error) => {
        logger.error('Aggregate error', String(error));
      });
    } else {
      logger.error(
        'Error details',
        `Code: ${statusCode}, Message: ${message}, Stack: ${stack}`,
      );
    }

    // Extract user information if available
    const user = request.user as User;
    let userId: number | null = null;
    if (user && 'id' in user) {
      userId = user.id;
    }

    // Store error in database
    // if (!isDevelopment) {
    //   const ERROR_MESSAGE_LENGTH = 4900;
    //   const errorEntity = this.errorRepository.create({
    //     code: String(statusCode),
    //     message: message,
    //     stack: isAggregateError
    //       ? exception.errors
    //           .map((err) => String(err))
    //           .join('\n')
    //           ?.slice(0, ERROR_MESSAGE_LENGTH)
    //       : stack?.slice(0, ERROR_MESSAGE_LENGTH),
    //     url: requestUrl,
    //     body: request.body ? JSON.stringify(request.body) : null,
    //     user: userId ? { id: userId } : null,
    //   });

    //   await this.errorRepository.save(errorEntity);
    // }

    // Response based on context types
    switch (contextType) {
      case ProtocolEnum.HTTP:
        response.status(statusCode).json({
          statusCode: statusCode,
          message: responseMessage,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;
      case ProtocolEnum.WS:
        response.emit('exception', {
          message: responseMessage,
          code: statusCode,
        });
        break;
      default:
        return;
    }
  }
}
