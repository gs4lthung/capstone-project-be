import { ConfigService } from '@app/config';
import { JwtPayloadDto } from '@app/shared/dtos/auth/jwt.payload.dto';
import { ProtocolEnum } from '@app/shared/enums/protocol.enum';
import { CustomRcpException } from '@app/shared/exceptions/custom-rcp.exception';
import { ContextUtils } from '@app/shared/utils/context.util';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { GraphQLError } from 'graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
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
        default:
          throw new CustomRcpException(
            'Unsupported context type',
            HttpStatus.BAD_REQUEST,
          );
      }

      const token = this.extractTokenFromHeader(request);
      if (!token) {
        if (context.getType() === 'http')
          throw new CustomRcpException(
            'Authorization token is missing',
            HttpStatus.UNAUTHORIZED,
          );
        else
          throw new GraphQLError('Authorization token is missing', {
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          });
      }

      const payload: JwtPayloadDto = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt').secret,
      });

      request.user = { id: payload.id };
    } catch {
      throw new CustomRcpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
