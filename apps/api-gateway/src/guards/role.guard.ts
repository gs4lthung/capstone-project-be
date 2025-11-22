import { User } from '@app/database/entities/user.entity';
import { ProtocolEnum } from '@app/shared/enums/protocol.enum';
import { ContextUtils } from '@app/shared/utils/context.util';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@app/shared/enums/user.enum';
import { CoachVerificationStatus } from '@app/shared/enums/coach.enum';

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
          throw new Error('Unsupported context type');
      }

      const userId = request.user?.id || request.user?.['id'];

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['role', 'coach', 'learner'],
      });

      if (!user || !user.role) {
        throw new Error('FORBIDDEN');
      }

      const hasRole = this.requiredRoles.includes(user.role.name);
      if (!hasRole) {
        throw new Error('FORBIDDEN');
      }

      switch (user.role.name) {
        case UserRole.COACH:
          if (
            user.coach[0].verificationStatus !==
            CoachVerificationStatus.VERIFIED
          ) {
            throw new Error('FORBIDDEN');
          }
          break;
        default:
          break;
      }
    } catch (error) {
      throw error;
    }
    return true;
  }
}
