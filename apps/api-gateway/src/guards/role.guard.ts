import { User } from '@app/database/entities/user.entity';
import { ProtocolEnum } from '@app/shared/enums/protocol.enum';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { ContextUtils } from '@app/shared/utils/context.util';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RoleGuard implements CanActivate {
  private requiredRoles: string[];

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      this.requiredRoles = this.reflector.get<string[]>(
        'roles',
        context.getHandler(),
      );

      if (!this.requiredRoles || this.requiredRoles.length === 0) {
        return true;
      }

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
          throw new CustomRpcException(
            'Unsupported context type',
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Error in AuthGuard: Unsupported context type',
            true,
          );
      }

      const userId = request.user?.id || request.user?.['id'];

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['role'],
      });

      if (!user || !user.role) {
        throw new CustomRpcException('FORBIDDEN', HttpStatus.FORBIDDEN);
      }

      const hasRole = this.requiredRoles.includes(user.role.name);
      if (!hasRole) {
        throw new CustomRpcException('FORBIDDEN', HttpStatus.FORBIDDEN);
      }
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
    return true;
  }
}
