import { CoachCredential } from '@app/database/entities/coach-credential.entity';
import { CoachPackage } from '@app/database/entities/coach-packages.entity';
import { CoachProfile } from '@app/database/entities/coach-profile.entity';
import { Role } from '@app/database/entities/role.entity';
import { User } from '@app/database/entities/user.entity';
import { RedisService } from '@app/redis';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import {
  CreateCoachPackageDto,
  CreateCoachProfileCredentialDto,
  CreateCoachProfileDto,
  UpdateCoachProfileCredentialDto,
  UpdateCoachProfileDto,
  VerifyCoachProfileDto,
} from '@app/shared/dtos/users/coaches/coach.dto';
import {
  CoachCredentialStatus,
  CoachVerificationStatus,
} from '@app/shared/enums/coach.enum';
import { UserRole } from '@app/shared/enums/user.enum';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { AwsService } from '@app/aws';

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
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationService: ClientProxy,
    private readonly awsService: AwsService,
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

      if (user.coachProfile || user.learnerProfile)
        throw new CustomRpcException(
          'COACH_PROFILE_ALREADY_EXISTS',
          HttpStatus.BAD_REQUEST,
        );

      const coachRole = await this.roleRepository.findOneBy({
        name: UserRole.COACH,
      });

      await this.userRepository.save({
        ...user,
        role: coachRole,
        coachProfile: {
          ...data,
        },
      });

      await this.redisService.del(`user:${userId}`);
      await this.redisService.delByPattern('users*');

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

  async createCoachProfileCredential(
    userId: number,
    data: CreateCoachProfileCredentialDto,
    file: Express.Multer.File,
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

      let publicUrl: string = null;
      if (file) {
        const fileBuffer = fs.readFileSync(`${file.path}`);
        const res = await this.awsService.uploadFileToPublicBucket({
          file: {
            ...file,
            buffer: fileBuffer,
          },
        });
        publicUrl = res.url;
      }

      await this.coachCredentialRepository.save({
        ...data,
        publicUrl: publicUrl,
        coachProfile: user.coachProfile,
        status: CoachCredentialStatus.PENDING,
      });

      await this.coachProfileRepository.update(user.coachProfile.id, {
        verificationStatus: CoachVerificationStatus.PENDING,
      });

      await this.redisService.del(`user:${userId}`);
      await this.redisService.delByPattern('users*');

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'COACH_CREDENTIAL_CREATE_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async updateCoachProfileCredential(
    userId: number,
    data: UpdateCoachProfileCredentialDto,
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

      const credential = await this.coachCredentialRepository.findOne({
        where: { id: data.id, coachProfile: { id: user.coachProfile.id } },
        withDeleted: false,
      });
      if (!credential) {
        throw new CustomRpcException(
          'COACH_CREDENTIAL_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.coachCredentialRepository.update(credential.id, {
        title: data.title ?? credential.title,
        issuedBy: data.issuedBy ?? credential.issuedBy,
        issueDate: data.issueDate ?? credential.issueDate,
        expirationDate: data.expirationDate ?? credential.expirationDate,
        credentialUrl: data.credentialUrl ?? credential.credentialUrl,
      });

      await this.coachProfileRepository.update(user.coachProfile.id, {
        verificationStatus: CoachVerificationStatus.PENDING,
      });

      await this.redisService.del(`user:${userId}`);
      await this.redisService.delByPattern('users*');

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'COACH_CREDENTIAL_UPDATE_SUCCESS',
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
      if (!admin || admin.role.name !== UserRole.ADMIN)
        throw new CustomRpcException('NOT_FOUND', HttpStatus.NOT_FOUND);

      const coachProfile = await this.coachProfileRepository.findOne({
        where: { id: data.id },
        relations: ['user'],
        withDeleted: false,
      });
      if (!coachProfile)
        throw new CustomRpcException(
          'COACH_PROFILE_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );

      await this.coachProfileRepository.update(coachProfile.id, {
        adminNote: data.adminNote ?? coachProfile.adminNote,
        verificationStatus: data.status,
      });

      await this.redisService.del(`user:${coachProfile.user.id}`);
      await this.redisService.delByPattern('users*');

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

      if (
        user.coachProfile.verificationStatus !==
        CoachVerificationStatus.APPROVED
      )
        throw new CustomRpcException(
          'COACH_PROFILE_NOT_APPROVED',
          HttpStatus.BAD_REQUEST,
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
