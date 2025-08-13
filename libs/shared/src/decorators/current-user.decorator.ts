import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomApiRequest } from '../requests/custom-api.request';
import { User } from '@app/database/entities/user.entity';
import { GoogleUserDto } from '../dtos/auth/google-user.dto';

export const CurrentUser = createParamDecorator(
  (data: 'local' | 'google', ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<CustomApiRequest>();
    switch (data) {
      case 'local':
        return request.user as User;
      case 'google':
        return request.user as GoogleUserDto;
      default:
        return request.user as User;
    }
  },
);
