import { ConfigService } from '@app/config';
import { JwtPayloadDto } from '@app/shared/dtos/auth/jwt.payload.dto';
import { CustomRcpException } from '@app/shared/exceptions/custom-rcp.exception';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new CustomRcpException('Authorization token is missing', 401);
    }

    try {
      const payload: JwtPayloadDto = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt').secret,
      });

      request.user = { id: payload.id };
    } catch {
      throw new CustomRcpException('Invalid token', 401);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
