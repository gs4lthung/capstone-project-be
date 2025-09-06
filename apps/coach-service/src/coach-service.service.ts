import { CoachCredential } from '@app/database/entities/coach_credential.entity';
import { CoachPackage } from '@app/database/entities/coach_packages';
import { CoachProfile } from '@app/database/entities/coach_profile.entity';
import { User } from '@app/database/entities/user.entity';
import { RedisService } from '@app/redis';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import {
  CreateCoachPackageDto,
  CreateCoachProfileDto,
  UpdateCoachProfileDto,
  VerifyCoachProfileDto,
} from '@app/shared/dtos/users/coaches/coach.dto';
import {
  CoachCredentialStatus,
  CoachVerificationStatus,
} from '@app/shared/enums/coach.enum';
import { RoleEnum } from '@app/shared/enums/role.enum';
import { SendNotification } from '@app/shared/interfaces/send-notification.interface';
import { NotificationMsgPattern } from '@app/shared/msg_patterns/notification.msg_pattern';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CoachServiceService {
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(CoachCredential)
    private readonly coachCredentialRepository: Repository<CoachCredential>,
    @InjectRepository(CoachProfile)
    private readonly coachProfileRepository: Repository<CoachProfile>,
    @InjectRepository(CoachPackage)
    private readonly coachPackageRepository: Repository<CoachPackage>,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationService: ClientProxy,
  ) {}
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

  async createCoachPackage(
    userId: number,
    data: CreateCoachPackageDto,
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

      await this.coachPackageRepository.save({
        ...data,
        coachProfile: user.coachProfile,
      });

      await this.redisService.del(`user:${userId}`);
      await this.redisService.delByPattern('users*');

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'COACH_PACKAGE_CREATE_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
