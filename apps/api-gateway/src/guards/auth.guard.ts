import { ConfigService } from '@app/config';
import { JwtPayloadDto } from '@app/shared/dtos/auth/jwt.payload.dto';
import { CustomRcpException } from '@app/shared/exceptions/custom-rcp.exception';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      let request;
      if (context.getType() === 'http') {
        request = context.switchToHttp().getRequest();
      } else {
        const ctx = GqlExecutionContext.create(context);
        request = ctx.getContext().req;
      }

      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new CustomRcpException(
          'Authorization token is missing',
          HttpStatus.UNAUTHORIZED,
        );
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
