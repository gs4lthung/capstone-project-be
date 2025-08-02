import { SetMetadata } from '@nestjs/common';

export const RoleDecorator = (...args: string[]) => SetMetadata('roles', args);
