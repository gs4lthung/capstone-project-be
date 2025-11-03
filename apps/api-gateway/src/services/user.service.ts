import { PaginatedUser, User } from '@app/database/entities/user.entity';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';

import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { REQUEST } from '@nestjs/core';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CreateUserDto } from '@app/shared/dtos/users/create-user.dto';
import { ConfigService } from '@app/config';
import { AwsService } from '@app/aws';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@app/database/entities/role.entity';
import { Repository } from 'typeorm';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { UserRole } from '@app/shared/enums/user.enum';
import * as bcrypt from 'bcrypt';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import * as fs from 'fs';
@Injectable({ scope: Scope.REQUEST })
export class UserService extends BaseTypeOrmService<User> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    private readonly configService: ConfigService,
    private readonly awsService: AwsService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {
    super(userRepository);
  }

  async create(data: CreateUserDto): Promise<CustomApiResponse<void>> {
    try {
      const isUserExists = await this.userRepository.findOne({
        where: { email: data.email },
      });

      if (isUserExists) {
        throw new CustomRpcException(
          'USER.ALREADY_EXISTS',
          HttpStatus.CONFLICT,
        );
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
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async findAll(findOptions: FindOptions): Promise<PaginatedUser> {
    return super.find(findOptions, 'user', PaginatedUser);
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: id },
        withDeleted: false,
      });

      if (!user)
        throw new CustomRpcException(
          'NOT_FOUND',
          HttpStatus.NOT_FOUND,
          `user:${id}`,
        );

      return user;
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async updateMyAvatar(
    file: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: this.request.user.id as User['id'] },
        withDeleted: false,
      });
      if (!user)
        throw new CustomRpcException(
          'INTERNAL_SERVER_ERROR',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      const fileBuffer = fs.readFileSync(`${file.path}`);
      const res = await this.awsService.uploadFileToPublicBucket({
        file: {
          ...file,
          buffer: fileBuffer,
        },
      });

      await this.userRepository.update(this.request.user.id, {
        profilePicture: res.url,
      });
      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'USER.UPDATE_USER_AVATAR_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async softDelete(id: number): Promise<CustomApiResponse<void>> {
    try {
      const isUserExists = await this.userRepository.findOne({
        where: { id: id },
      });

      if (!isUserExists) {
        throw new CustomRpcException('USER.NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      await this.userRepository.softDelete(id);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'USER.DELETE_USER_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async delete(id: number): Promise<CustomApiResponse<void>> {
    try {
      const isUserExists = await this.userRepository.findOne({
        where: { id: id },
      });

      if (!isUserExists) {
        throw new CustomRpcException('USER.NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      await this.userRepository.delete(id);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'USER.DELETE_USER_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async restore(id: number): Promise<CustomApiResponse<void>> {
    try {
      const isUserExists = await this.userRepository.findOne({
        where: { id: id },
        withDeleted: true,
      });

      if (!isUserExists) {
        throw new CustomRpcException('USER.NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      await this.userRepository.restore(id);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'USER.RESTORE_USER_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
