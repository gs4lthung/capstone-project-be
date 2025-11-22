import { User } from '@app/database/entities/user.entity';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';

import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { REQUEST } from '@nestjs/core';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CreateUserDto } from '@app/shared/dtos/users/create-user.dto';
import { ConfigService } from '@app/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@app/database/entities/role.entity';
import { Repository } from 'typeorm';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { UserRole } from '@app/shared/enums/user.enum';
import * as bcrypt from 'bcrypt';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { BunnyService } from '@app/bunny';
@Injectable({ scope: Scope.REQUEST })
export class UserService extends BaseTypeOrmService<User> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    private readonly configService: ConfigService,
    private readonly bunnyService: BunnyService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {
    super(userRepository);
  }

  async create(data: CreateUserDto): Promise<CustomApiResponse<void>> {
    const isUserExists = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (isUserExists) {
      throw new BadRequestException('USER.ALREADY_EXISTS');
    }

    const passwordHashed = await bcrypt.hash(
      data.password,
      this.configService.get('password_salt_rounds'),
    );

    const learnerRole = await this.roleRepository.findOne({
      where: { name: UserRole.LEARNER },
    });

    const user = this.userRepository.create({
      fullName: data.fullName,
      email: data.email,
      password: passwordHashed,
      role: data.role ? data.role : learnerRole,
      isEmailVerified: true,
    });

    await this.userRepository.save(user);

    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'USER.CREATE_USER_SUCCESS',
    );
  }

  async findAll(findOptions: FindOptions): Promise<PaginateObject<User>> {
    return super.find(findOptions, 'user', PaginateObject<User>);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: id },
      withDeleted: false,
    });

    if (!user) throw new BadRequestException('USER.NOT_FOUND');

    return user;
  }

  async updateMyAvatar(
    file: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    const user = await this.userRepository.findOne({
      where: { id: this.request.user.id as User['id'] },
      withDeleted: false,
    });
    if (!user) throw new BadRequestException('USER.NOT_FOUND');
    const res = await this.bunnyService.uploadToStorage({
      filePath: file.path,
      type: 'avatar',
      id: Date.now(),
    });

    await this.userRepository.update(this.request.user.id, {
      profilePicture: res,
    });
    return new CustomApiResponse<void>(
      HttpStatus.OK,
      'USER.UPDATE_USER_AVATAR_SUCCESS',
    );
  }

  async softDelete(id: number): Promise<CustomApiResponse<void>> {
    const isUserExists = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!isUserExists) {
      throw new BadRequestException('USER.NOT_FOUND');
    }

    await this.userRepository.softDelete(id);

    return new CustomApiResponse<void>(
      HttpStatus.OK,
      'USER.DELETE_USER_SUCCESS',
    );
  }

  async delete(id: number): Promise<CustomApiResponse<void>> {
    const isUserExists = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!isUserExists) {
      throw new BadRequestException('USER.NOT_FOUND');
    }

    await this.userRepository.delete(id);

    return new CustomApiResponse<void>(
      HttpStatus.OK,
      'USER.DELETE_USER_SUCCESS',
    );
  }

  async restore(id: number): Promise<CustomApiResponse<void>> {
    const isUserExists = await this.userRepository.findOne({
      where: { id: id },
      withDeleted: true,
    });

    if (!isUserExists) {
      throw new BadRequestException('USER.NOT_FOUND');
    }

    await this.userRepository.restore(id);

    return new CustomApiResponse<void>(
      HttpStatus.OK,
      'USER.RESTORE_USER_SUCCESS',
    );
  }
}
