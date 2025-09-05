import { User } from '@app/database/entities/user.entity';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CreateUserDto } from '@app/shared/dtos/users/create-user.dto';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { REQUEST } from '@nestjs/core';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { lastValueFrom } from 'rxjs';
import { UserMsgPattern } from '@app/shared/msg_patterns/user.msg_pattern';
import { PaginatedUser } from '@app/shared/dtos/users/user.dto';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}
  async create(data: CreateUserDto) {
    const pattern = { cmd: UserMsgPattern.CREATE_USER };
    const payload = data;

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async findAll(findOptions: FindOptions): Promise<PaginatedUser> {
    const pattern = { cmd: UserMsgPattern.FIND_ALL_USERS };

    const response = await lastValueFrom(
      this.userService.send<PaginatedUser>(pattern, findOptions),
    );

    console.log(response);

    return response;
  }

  async findOne(id: number): Promise<User> {
    const pattern = { cmd: UserMsgPattern.FIND_USER_BY_ID };
    const payload = id;

    const response = await lastValueFrom(
      this.userService.send<User>(pattern, payload),
    );
    return response;
  }

  async updateMyAvatar(file: Express.Multer.File) {
    const pattern = { cmd: UserMsgPattern.UPDATE_MY_AVATAR };
    const payload = { id: this.request.user.id, file };

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async softDelete(id: number) {
    const pattern = { cmd: UserMsgPattern.SOFT_DELETE_USER };
    const payload = id;

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async delete(id: number) {
    const pattern = { cmd: UserMsgPattern.DELETE_USER };
    const payload = id;

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async restore(id: number) {
    const pattern = { cmd: UserMsgPattern.RESTORE_USER };
    const payload = id;

    const response = await lastValueFrom(
      this.userService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }
}
