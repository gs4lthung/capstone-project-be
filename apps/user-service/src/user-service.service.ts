import { CloudinaryService } from '@app/cloudinary';
import { User } from '@app/database/entities/user.entity';
import { CreateUserDto } from '@app/shared/dtos/users/create-user.dto';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@app/config';
import { Role } from '@app/database/entities/role.entity';
import { RoleEnum } from '@app/shared/enums/role.enum';
import { RedisService } from '@app/redis';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { getOrder, getWhere } from '@app/shared/helpers/typeorm.helper';
import { ClientProxy } from '@nestjs/microservices';
import { SendNotification } from '@app/shared/interfaces/send-notification.interface';
import * as fs from 'fs';
import { PaginatedUser } from '@app/shared/dtos/users/user.dto';
import {
  CreateCoachProfileDto,
  UpdateCoachProfileDto,
} from '@app/shared/dtos/users/coaches/coach.dto';
import { NotificationMsgPattern } from '@app/shared/msg_patterns/notification.msg_pattern';
import { CoachCredentialStatus } from '@app/shared/enums/coach.enum';

@Injectable()
export class UserServiceService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationService: ClientProxy,
  ) {}

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

      const customerRole = await this.roleRepository.findOne({
        where: { name: RoleEnum.CUSTOMER },
      });

      const user = this.userRepository.create({
        fullName: data.fullName,
        email: data.email,
        password: passwordHashed,
        role: data.role ? data.role : customerRole,
        isEmailVerified: true,
      });

      await this.userRepository.save(user);

      await this.redisService.delByPattern('users');

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'USER.CREATE_USER_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async findAll(findOptions: FindOptions): Promise<PaginatedUser> {
    try {
      let where = {};
      let order = {};

      if (findOptions.filtering) where = getWhere(findOptions.filtering);
      if (findOptions.sorting) order = getOrder(findOptions.sorting);

      const [users, total] = await this.userRepository.findAndCount({
        where: where,
        order: order,
        take: findOptions.pagination.size,
        skip: findOptions.pagination.offset,
        withDeleted: false,
      });

      return {
        items: users,
        page: findOptions.pagination.page,
        total: total,
        pageSize: findOptions.pagination.size,
      };
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
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
    id: number,
    file: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: id },
        withDeleted: false,
      });
      if (!user)
        throw new CustomRpcException(
          'INTERNAL_SERVER_ERROR',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      const fileBuffer = fs.readFileSync(`${file.path}`);
      const res = await this.cloudinaryService.uploadFile({
        file: {
          ...file,
          buffer: fileBuffer,
        },
      });

      await this.userRepository.update(id, {
        profilePicture: res.url,
      });

      await this.redisService.del(`user:${id}:`);
      await this.redisService.delByPattern('users*');

      this.notificationService.emit<SendNotification>('send_notification', {
        userId: id,
        title: 'Profile Picture Updated',
        body: 'Your profile picture has been updated successfully.',
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

      await this.redisService.delByPattern('users');

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

      await this.redisService.delByPattern('users');

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

      await this.redisService.delByPattern('users');

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'USER.RESTORE_USER_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async createCoachProfile(
    userId: number,
    data: CreateCoachProfileDto,
  ): Promise<CustomApiResponse<void>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        withDeleted: false,
      });
      if (!user)
        throw new CustomRpcException('NOT_FOUND', HttpStatus.NOT_FOUND);

      if (user.coachProfile)
        throw new CustomRpcException(
          'COACH_PROFILE_ALREADY_EXISTS',
          HttpStatus.CONFLICT,
        );

      await this.userRepository.save({
        ...user,
        coachProfile: {
          ...data,
        },
      });

      await this.redisService.del(`user:${userId}`);
      await this.redisService.delByPattern('users*');

      this.notificationService.emit<SendNotification>(
        NotificationMsgPattern.SEND_NOTIFICATION,
        {
          userId: userId,
          title: 'Coach Profile Created',
          body: 'Your coach profile has been created successfully.',
        },
      );

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'COACH_PROFILE_CREATE_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async updateCoachProfile(
    userId: number,
    data: UpdateCoachProfileDto,
  ): Promise<CustomApiResponse<void>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        withDeleted: false,
      });
      if (!user)
        throw new CustomRpcException('NOT_FOUND', HttpStatus.NOT_FOUND);

      if (!user.coachProfile)
        throw new CustomRpcException(
          'COACH_PROFILE_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );

      let updatedCredentials = [];
      let nonUpdateCredentials = [];
      if (data.credentials) {
        if (
          user.coachProfile.credentials &&
          user.coachProfile.credentials.length > 0
        ) {
          const existingCredentials = user.coachProfile.credentials;
          updatedCredentials = data.credentials.map((cred) => {
            const existingCred = existingCredentials.find(
              (c) =>
                c.id === cred.id && c.status === CoachCredentialStatus.PENDING,
            );
            return existingCred ? { ...existingCred, ...cred } : cred;
          });
          nonUpdateCredentials = data.credentials.map((cred) => {
            const existingCred = existingCredentials.find(
              (c) =>
                c.id === cred.id && c.status !== CoachCredentialStatus.PENDING,
            );
            return existingCred;
          });

          if (nonUpdateCredentials.length > 0) {
            throw new CustomRpcException(
              'CREDENTIALS_UNDER_REVIEW',
              HttpStatus.BAD_REQUEST,
            );
          }
        } else {
          updatedCredentials = data.credentials.map((cred) => cred);
        }

        updatedCredentials = updatedCredentials.map((cred) => ({
          ...cred,
          status: CoachCredentialStatus.PENDING,
        }));
      }
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
