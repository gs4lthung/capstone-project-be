import { HttpStatus } from '@nestjs/common';
import { CustomRpcException } from '../interfaces/exceptions/custom-rpc.exception';

export class ExceptionUtils {
  static wrapAsRpcException(error: unknown): CustomRpcException {
    if (error instanceof CustomRpcException) return error;

    const message = error instanceof Error ? error.message : 'Unknown error';

    return new CustomRpcException(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.stack : undefined,
      true,
    );
  }
}
