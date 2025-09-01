import { User } from '@app/database/entities/user.entity';
import { GoogleUserDto } from '../dtos/auth/google-user.dto';

export interface CustomApiRequest extends Request {
  user?:
    | Pick<User, 'id'>
    | Pick<
        GoogleUserDto,
        | 'id'
        | 'email'
        | 'firstName'
        | 'lastName'
        | 'picture'
        | 'accessToken'
        | 'refreshToken'
      >;
  query: CustomApiQuery;
  body: any;
}

export interface CustomApiQuery {
  id?: number | string;
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
  lang?: 'en' | 'vi';
}
