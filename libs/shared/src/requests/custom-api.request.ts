import { User } from '@app/database/entities/user.entity';

export interface CustomApiRequest extends Request {
  user?: User;
}
