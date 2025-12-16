import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Scope,
  Inject,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '@app/database/entities/user.entity';
import { Credential } from '@app/database/entities/credential.entity';
import { CoachVerificationStatus } from '@app/shared/enums/coach.enum';
import {
  RegisterCoachDto,
  UpdateCoachProfileDto,
} from '@app/shared/dtos/coaches/register-coach.dto';
import { Role } from '@app/database/entities/role.entity';
import { UserRole } from '@app/shared/enums/user.enum';
import { ConfigService } from '@app/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { Feedback } from '@app/database/entities/feedback.entity';
import { REQUEST } from '@nestjs/core';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { Coach } from '@app/database/entities/coach.entity';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { JwtPayloadDto } from '@app/shared/dtos/auth/jwt.payload.dto';
import { MailSendDto } from '@app/shared/dtos/mails/mail-send.dto';
import { MailService } from './mail.service';
import { TwilioService } from '@app/twilio';
import { NotificationService } from './notification.service';
import { NotificationType } from '@app/shared/enums/notification.enum';
import { BunnyService } from '@app/bunny';
import { BaseCredential } from '@app/database/entities/base-credential.entity';
import { CryptoUtils } from '@app/shared/utils/crypto.util';
@Injectable({ scope: Scope.REQUEST })
export class CoachService extends BaseTypeOrmService<Coach> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly datasource: DataSource,
    private readonly mailService: MailService,
    private readonly twilioService: TwilioService,
    private readonly notificationService: NotificationService,
    private readonly bunnyService: BunnyService,
  ) {
    super(coachRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginateObject<Coach>> {
    return super.find(findOptions, 'coach', PaginateObject<Coach>);
  }

  async findOne(id: number, isUser: boolean): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: isUser
        ? { user: { id: id } }
        : {
            id: id,
          },
      withDeleted: false,
      relations: [
        'user',
        'user.province',
        'user.district',
        'credentials',
        'credentials.baseCredential',
      ],
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    return coach;
  }

  async getOverallRating(
    id: number,
  ): Promise<CustomApiResponse<{ overall: number; total: number }>> {
    return await this.datasource.transaction(async (manager) => {
      const feedbacks = await manager.getRepository(Feedback).find({
        where: {
          receivedBy: { id: id },
        },
      });
      if (feedbacks.length === 0)
        return new CustomApiResponse<{ overall: number; total: number }>(
          HttpStatus.OK,
          'Không có đánh giá',
          {
            overall: 0,
            total: 0,
          },
        );
      const totalRating = feedbacks.reduce(
        (acc, feedback) => acc + feedback.rating,
        0,
      );
      const overallRating = totalRating / feedbacks.length;
      return new CustomApiResponse<{ overall: number; total: number }>(
        HttpStatus.OK,
        'Success',
        {
          overall: overallRating,
          total: feedbacks.length,
        },
      );
    });
  }

  async registerCoach(
    data: RegisterCoachDto,
    files: Express.Multer.File[],
  ): Promise<CustomApiResponse<void>> {
    console.log('RegisterCoachDto data:', data);
    console.log('Uploaded files:', files);
    return await this.datasource.transaction(async (manager) => {
      let existingUser: User;
      if (data.email) {
        existingUser = await manager.getRepository(User).findOne({
          where: { email: data.email },
        });
        if (existingUser) {
          throw new BadRequestException('Email đã tồn tại');
        }
      }

      if (data.phoneNumber) {
        existingUser = await manager.getRepository(User).findOne({
          where: { phoneNumber: data.phoneNumber },
        });
        if (existingUser) {
          throw new BadRequestException('Số điện thoại đã tồn tại');
        }
      }

      const passwordHashed = await bcrypt.hash(
        data.password,
        this.configService.get('password_salt_rounds'),
      );

      const coachRole = await manager.getRepository(Role).findOne({
        where: { name: UserRole.COACH },
      });
      if (!coachRole) {
        throw new BadRequestException('Coach role not found');
      }

      const coachCredentials: Credential[] = [];
      if (data.coach.credentials && data.coach.credentials.length > 0) {
        for (let i = 0; i < data.coach.credentials.length; i++) {
          const baseCredential = await manager
            .getRepository(BaseCredential)
            .findOne({
              where: { id: data.coach.credentials[i].baseCredential },
            });
          if (!baseCredential) {
            throw new BadRequestException(
              `Base credential with id ${data.coach.credentials[i].baseCredential} not found`,
            );
          }

          const publicUrl = await this.bunnyService.uploadToStorage({
            id: CryptoUtils.generateRandomNumber(100_000, 999_999),
            filePath: files[i].path,
            type: 'credential_image',
          });
          const credential = manager.getRepository(Credential).create({
            baseCredential: baseCredential,
            publicUrl: publicUrl,
            issuedAt: data.coach.credentials[i].issuedAt,
            expiresAt: data.coach.credentials[i].expiresAt,
          });
          coachCredentials.push(credential);
        }
      }

      const newUser = manager.getRepository(User).create({
        fullName: data.fullName,
        email: data.email ? data.email : null,
        phoneNumber: data.phoneNumber ? data.phoneNumber : null,
        password: passwordHashed,
        province: data.province ? { id: data.province } : null,
        district: data.district ? { id: data.district } : null,
        role: coachRole,
        coach: [
          {
            bio: data.coach.bio,
            specialties: data.coach.specialties,
            teachingMethods: data.coach.teachingMethods,
            yearOfExperience: data.coach.yearOfExperience,
            verificationStatus: CoachVerificationStatus.UNVERIFIED,
            credentials: coachCredentials,
          },
        ],
        wallet: {
          currentBalance: 0,
        },
      });

      if (data.email) {
        const payload: JwtPayloadDto = {
          id: newUser.id,
        };
        const emailVerificationToken = await this.jwtService.signAsync(
          payload,
          {
            secret: this.configService.get('jwt').verify_email_token.secret,
            expiresIn: this.configService.get('jwt').verify_email_token
              .expiration as any,
          },
        );

        newUser.emailVerificationToken = emailVerificationToken;

        await this.sendVerificationEmail(data.email, emailVerificationToken);
      }

      if (data.phoneNumber) {
        await this.twilioService.sendSMS(data.phoneNumber);
      }

      await manager.getRepository(User).save(newUser);

      await this.notificationService.sendNotificationToAdmins({
        title: 'Huấn luyện viên mới đăng ký',
        body: `Huấn luyện viên ${newUser.fullName} đã đăng ký và đang chờ xác minh.`,
        navigateTo: `/coaches?coachId=${newUser.coach[0].id}`,
        type: NotificationType.INFO,
      });

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'Đăng ký thành công',
      );
    });
  }

  async update(data: UpdateCoachProfileDto): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const coach = await manager.getRepository(Coach).findOne({
        where: {
          user: { id: this.request.user.id as User['id'] },
        },
        relations: ['user', 'credentials', 'credentials.baseCredential'],
      });
      if (!coach)
        throw new NotFoundException('Không tìm thấy hồ sơ huấn luyện viên');
      if (coach.verificationStatus === CoachVerificationStatus.VERIFIED) {
        throw new BadRequestException(
          'Không thể cập nhật hồ sơ huấn luyện viên đã được xác minh',
        );
      }

      const updateData = data as any;

      const credentialsToUpdate = data.credentials;
      if (credentialsToUpdate && credentialsToUpdate.length > 0) {
        for (const credentialData of credentialsToUpdate) {
          updateData.credentials = coach.credentials.map((credential) => {
            if (credential.id === credentialData.id) {
              return {
                ...credential,
                issuedAt: credentialData.issuedAt ?? credential.issuedAt,
                expiresAt: credentialData.expiresAt ?? credential.expiresAt,
                baseCredential: credentialData.baseCredential
                  ? { id: credentialData.baseCredential }
                  : credential.baseCredential,
              };
            }
            return credential;
          });
        }
      }

      await manager.getRepository(Coach).update(coach.id, updateData);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Cập nhật hồ sơ huấn luyện viên thành công',
      );
    });
  }

  async coachGetCredentials(): Promise<Credential[]> {
    return await this.datasource.transaction(async (manager) => {
      const coach = await manager.getRepository(Coach).findOne({
        where: {
          user: { id: this.request.user.id as User['id'] },
        },
        relations: ['credentials', 'credentials.baseCredential'],
      });
      if (!coach) throw new NotFoundException('Coach not found');
      return coach.credentials;
    });
  }

  async verifyCoach(coachId: number): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const coach = await this.coachRepository.findOne({
        where: { id: coachId },
        relations: ['user', 'credentials', 'credentials.baseCredential'],
      });
      if (!coach) throw new NotFoundException('Coach not found');

      await this.coachRepository.update(coach.id, {
        verificationStatus: CoachVerificationStatus.VERIFIED,
      });

      if (!coach.user.isActive) {
        await manager
          .getRepository(User)
          .update(coach.user.id, { isActive: true });
      }

      await this.notificationService.sendNotification({
        userId: coach.user.id,
        title: 'Xác minh huấn luyện viên thành công',
        body: 'Hồ sơ huấn luyện viên của bạn đã được xác minh thành công.',
        navigateTo: `/(coach)/menu/profile`,
        type: NotificationType.SUCCESS,
      });

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Xác minh huấn luyện viên thành công',
      );
    });
  }

  async rejectCoach(
    coachId: number,
    reason?: string,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      await manager.getTreeRepository(Coach).update(coachId, {
        verificationStatus: CoachVerificationStatus.REJECTED,
      });

      await this.notificationService.sendNotification({
        userId: coachId,
        title: 'Yêu cầu xác minh huấn luyện viên bị từ chối',
        body: reason ? reason : 'Từ chối xác minh huấn luyện viên',
        navigateTo: `/(coach)/menu/profile`,
        type: NotificationType.INFO,
      });

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Từ chối xác minh huấn luyện viên thành công',
      );
    });
  }

  private async sendVerificationEmail(
    email: string,
    emailVerificationToken: string,
  ): Promise<void> {
    this.mailService.sendMail({
      to: email,
      subject: 'Email Verification',
      text: 'Please verify your email address',
      template: './verify-mail',
      context: {
        verificationLink: `${this.configService.get('app').url}/api/${this.configService.get('app').version}/auth/verify-email?token=${emailVerificationToken}`,
      },
    } as MailSendDto);
  }
}
