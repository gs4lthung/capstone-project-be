import { ConfigService } from '@app/config';
import { User } from '@app/database/entities/user.entity';
import { JwtPayloadDto } from '@app/shared/dtos/auth/jwt.payload.dto';
import { ProtocolEnum } from '@app/shared/enums/protocol.enum';
import { AuthUtils } from '@app/shared/utils/auth.util';
import { ContextUtils } from '@app/shared/utils/context.util';
import {
  BadGatewayException,
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
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
        case ProtocolEnum.WS:
          request = context.switchToWs().getClient<Request>();
          break;
        default:
          throw new BadGatewayException('Unsupported context type');
      }

      let token = '';
      switch (contextType) {
        case ProtocolEnum.HTTP:
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
        throw new BadRequestException('AUTH.TOKEN_MISSING_IN_REQUEST');
      }

      const payload: JwtPayloadDto = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt').access_token.secret,
      });

      const isUserExists = await this.userRepository.findOne({
        where: { id: payload.id, isActive: true },
        withDeleted: false,
      });
      if (!isUserExists) {
        throw new BadRequestException('AUTH.USER_NOT_FOUND');
      }

      request.user = { id: payload.id };

      if (contextType === ProtocolEnum.WS) {
        const client = context.switchToWs().getClient();
        client.userId = payload.id;
      }
    } catch (error) {
      if (error instanceof TokenExpiredError)
        throw new BadRequestException('AUTH.TOKEN_EXPIRED');
      throw error;
    }
    return true;
  }
}
