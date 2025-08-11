import { SetMetadata } from '@nestjs/common';

export const CheckRoleDecorator = (...args: string[]) =>
  SetMetadata('roles', args);
