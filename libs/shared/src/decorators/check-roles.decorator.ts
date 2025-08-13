import { SetMetadata } from '@nestjs/common';

export const CheckRoles = (...args: string[]) => SetMetadata('roles', args);
