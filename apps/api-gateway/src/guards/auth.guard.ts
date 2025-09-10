import { ConfigService } from '@app/config';
import { User } from '@app/database/entities/user.entity';
import { JwtPayloadDto } from '@app/shared/dtos/auth/jwt.payload.dto';
import { ProtocolEnum } from '@app/shared/enums/protocol.enum';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { AuthUtils } from '@app/shared/utils/auth.util';
import { ContextUtils } from '@app/shared/utils/context.util';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
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
            HttpStatus.INTERNAL_SERVER_ERROR,
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
          'AUTH.INVALID_TOKEN',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const payload: JwtPayloadDto = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt').access_token.secret,
      });

      const isUserExists = await this.userRepository.findOne({
        where: { id: payload.id },
        withDeleted: false,
      });
      if (!isUserExists) {
        throw new CustomRpcException(
          'AUTH.INVALID_TOKEN',
          HttpStatus.UNAUTHORIZED,
        );
      }

      request.user = { id: payload.id };

      if (contextType === ProtocolEnum.WS) {
        const client = context.switchToWs().getClient();
        client.userId = payload.id;
      }
    } catch (error) {
      if (error instanceof TokenExpiredError)
        throw new CustomRpcException(
          'AUTH.INVALID_TOKEN',
          HttpStatus.UNAUTHORIZED,
        );
      throw ExceptionUtils.wrapAsRpcException(error);
    }
    return true;
  }
}
