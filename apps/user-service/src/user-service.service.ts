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
  VerifyCoachProfileDto,
} from '@app/shared/dtos/users/coaches/coach.dto';
import { NotificationMsgPattern } from '@app/shared/msg_patterns/notification.msg_pattern';
import {
  CoachCredentialStatus,
  CoachVerificationStatus,
} from '@app/shared/enums/coach.enum';
import { CoachCredential } from '@app/database/entities/coach_credential.entity';
import { CoachProfile } from '@app/database/entities/coach_profile.entity';

@Injectable()
export class UserServiceService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(CoachCredential)
    private readonly coachCredentialRepository: Repository<CoachCredential>,
    @InjectRepository(CoachProfile)
    private readonly coachProfileRepository: Repository<CoachProfile>,
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
        NotificationMsgPattern.SEND_NOTIFICATION_TO_ADMINS,
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

      if (!user) {
        throw new CustomRpcException('NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      if (!user.coachProfile) {
        throw new CustomRpcException(
          'COACH_PROFILE_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }

      const existingCredentials = await this.coachCredentialRepository.find({
        where: { coachProfile: { id: user.coachProfile.id } },
      });
      let updatedCredentials = [];
      let newCredentials = [];

      if (data.credentials) {
        const nonUpdateCredentials = data.credentials.filter((cred) =>
          existingCredentials.some(
            (c) =>
              c.id === cred.id && c.status !== CoachCredentialStatus.PENDING,
          ),
        );

        if (nonUpdateCredentials.length > 0) {
          throw new CustomRpcException(
            'CREDENTIALS_UNDER_REVIEW',
            HttpStatus.BAD_REQUEST,
          );
        }

        updatedCredentials = data.credentials.filter((cred) =>
          existingCredentials.some(
            (c) =>
              c.id === cred.id && c.status === CoachCredentialStatus.PENDING,
          ),
        );

        existingCredentials.forEach((cred) => {
          const toUpdate = updatedCredentials.find((c) => c.id === cred.id);
          if (toUpdate) {
            cred.title = toUpdate.title ?? cred.title;
            cred.issuedBy = toUpdate.issuedBy ?? cred.issuedBy;
            cred.issueDate = toUpdate.issueDate ?? cred.issueDate;
            cred.credentialUrl = toUpdate.credentialUrl ?? cred.credentialUrl;
            cred.status = CoachCredentialStatus.PENDING;
            cred.coachProfile = user.coachProfile;
          }
        });

        newCredentials = data.credentials
          .filter((cred) => !cred.id)
          .map((cred) => {
            return {
              ...cred,
              coachProfile: user.coachProfile,
            };
          });
        existingCredentials.push(...newCredentials);

        await this.coachCredentialRepository.save(existingCredentials);
      }

      await this.coachProfileRepository.update(user.coachProfile.id, {
        bio: data.bio ?? user.coachProfile.bio,
        specialties: data.specialties ?? user.coachProfile.specialties,
        basePrice: data.basePrice ?? user.coachProfile.basePrice,
        verificationStatus: CoachVerificationStatus.PENDING,
      });

      await this.redisService.del(`user:${userId}:`);
      await this.redisService.delByPattern('users*');

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'COACH_PROFILE_UPDATE_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async verifyCoachProfile(
    adminId: number,
    data: VerifyCoachProfileDto,
  ): Promise<CustomApiResponse<void>> {
    try {
      console.log(data);
      const admin = await this.userRepository.findOne({
        where: { id: adminId },
        withDeleted: false,
      });
      if (!admin || admin.role.name !== RoleEnum.ADMIN)
        throw new CustomRpcException('NOT_FOUND', HttpStatus.NOT_FOUND);

      const coachProfile = await this.coachProfileRepository.findOne({
        where: { id: data.id },
        withDeleted: false,
      });
      if (!coachProfile)
        throw new CustomRpcException(
          'COACH_PROFILE_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );

      const existingCredentials = await this.coachCredentialRepository.find({
        where: { coachProfile: { id: coachProfile.id } },
      });
      const updateCredentials = data.credentials.filter((cred) =>
        existingCredentials.some((c) => c.id === cred.id),
      );

      let updatedProfileStatus = coachProfile.verificationStatus;

      for (const cred of updateCredentials) {
        if (cred.status === CoachCredentialStatus.PENDING) continue;
        if (cred.status === CoachCredentialStatus.REJECTED) {
          updatedProfileStatus = CoachVerificationStatus.REJECTED;
          break;
        }
        if (cred.status === CoachCredentialStatus.VERIFIED) {
          updatedProfileStatus = CoachVerificationStatus.APPROVED;
        }
      }

      await this.coachProfileRepository.update(coachProfile.id, {
        verificationStatus: updatedProfileStatus,
      });

      await this.coachCredentialRepository.save(
        existingCredentials.map((cred) => {
          const toUpdate = updateCredentials.find((c) => c.id === cred.id);
          if (toUpdate) {
            cred.status = toUpdate.status ?? cred.status;
          }
          return cred;
        }),
      );

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'COACH_PROFILE_VERIFICATION_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
