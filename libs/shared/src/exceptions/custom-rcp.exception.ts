import { RpcException } from '@nestjs/microservices';

export class CustomRcpException extends RpcException {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super({ message, statusCode });
  }
}
