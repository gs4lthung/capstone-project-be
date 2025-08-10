import { RpcException } from '@nestjs/microservices';

export class CustomRpcException extends RpcException {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly stack?: string,
    public readonly isServerError: boolean = statusCode >= 500,
  ) {
    super({ message, statusCode, stack, isServerError });
  }
}
