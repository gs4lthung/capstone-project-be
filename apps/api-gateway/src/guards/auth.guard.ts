import { ConfigService } from '@app/config';
import { User } from '@app/database/entities/user.entity';
import { JwtPayloadDto } from '@app/shared/dtos/auth/jwt.payload.dto';
import { ProtocolEnum } from '@app/shared/enums/protocol.enum';
import { CustomRpcException } from '@app/shared/exceptions/custom-rpc.exception';
import { AuthUtils } from '@app/shared/utils/auth.util';
import { ContextUtils } from '@app/shared/utils/context.util';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      let request;
      const contextType = ContextUtils.getRequestContextType(context.getType());
      switch (contextType) {
        case ProtocolEnum.HTTP:
          request = context.switchToHttp().getRequest();
          break;
        case ProtocolEnum.GRAPHQL:
          const ctx = GqlExecutionContext.create(context);
          request = ctx.getContext().req;
          break;
        case ProtocolEnum.WS:
          request = context.switchToWs().getClient<Request>();
          break;
        default:
          throw new CustomRpcException(
            'Unsupported context type',
            HttpStatus.BAD_REQUEST,
            'Error in AuthGuard: Unsupported context type',
          );
      }

      let token = '';
      switch (contextType) {
        case ProtocolEnum.HTTP:
        case ProtocolEnum.GRAPHQL:
          token = AuthUtils.extractTokenFromHeader(request);
          break;
        case ProtocolEnum.WS:
          token = request.handshake.query.accessToken;
          break;
        default:
          token = AuthUtils.extractTokenFromHeader(request);
          break;
      }
      if (!token) {
        throw new CustomRpcException(
          'Authorization token is missing',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const payload: JwtPayloadDto = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt').secret,
      });

      const isUserExists = await this.userRepository.findOne({
        where: { id: payload.id, isActive: true },
      });
      if (!isUserExists) {
        throw new CustomRpcException(
          'User not found or inactive',
          HttpStatus.UNAUTHORIZED,
        );
      }

      request.user = { id: payload.id };
    } catch {
      throw new CustomRpcException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return true;
  }
}
