import { User } from '@app/database/entities/user.entity';
import { PickType } from '@nestjs/mapped-types';

export class JwtPayloadDto extends PickType(User, ['id'] as const) {
  id: number;

  constructor(partial: Partial<JwtPayloadDto>) {
    super();
    Object.assign(this, partial);
  }
}
