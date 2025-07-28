import { RpcException } from '@nestjs/microservices';

export class CustomRpcException extends RpcException {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly stack?: string,
  ) {
    super({ message, statusCode, stack });
  }
}
