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
  RegisterCoachCredentialDto,
  RegisterCoachDto,
  UpdateCoachProfileDto,
  UpdateCredentialDto,
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
import { BunnyService } from '@app/bunny';
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
    private readonly bunnyService: BunnyService,
  ) {
    super(coachRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginateObject<Coach>> {
    return super.find(findOptions, 'coach', PaginateObject<Coach>);
  }

  async findOne(id: number): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: {
        user: {
          id: id,
        },
      },
      withDeleted: false,
      relations: ['user', 'credentials'],
    });

    if (!coach) throw new Error('Coach not found');

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
          'No feedbacks found',
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
  ): Promise<CustomApiResponse<void>> {
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
            ...(data.coach as Coach),
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
        relations: ['user'],
      });
      if (!coach) throw new NotFoundException('Coach not found');
      await manager.getRepository(Coach).update(coach.id, data);
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
        relations: ['credentials'],
      });
      if (!coach) throw new NotFoundException('Coach not found');
      return coach.credentials;
    });
  }

  async uploadCredential(
    data: RegisterCoachCredentialDto,
    file: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const coach = await this.coachRepository.findOne({
        where: {
          user: { id: this.request.user.id as User['id'] },
        },
        relations: ['user', 'credentials'],
      });
      if (!coach) throw new NotFoundException('Coach not found');
      if (file) {
        const credentialFilePath = await this.bunnyService.uploadToStorage({
          id: Date.now(),
          type: 'credential_image',
          filePath: file.path,
        });
        data.publicUrl = credentialFilePath;
      }
      const newCredential = manager.getRepository(Credential).create({
        ...data,
        coach: coach,
      });
      await manager.getRepository(Credential).save(newCredential);
      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Cập nhật giấy tờ thành công',
      );
    });
  }

  async updateCredential(
    id: number,
    data: UpdateCredentialDto,
    file?: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const credential = await manager.getRepository(Credential).findOne({
        where: { id: id },
        relations: ['coach', 'coach.user'],
      });
      if (!credential) throw new NotFoundException('Credential not found');
      if (credential.coach.user.id !== this.request.user.id) {
        throw new BadRequestException('You are not authorized to update this');
      }
      if (file) {
        const credentialFilePath = await this.bunnyService.uploadToStorage({
          id: Date.now(),
          type: 'credential_image',
          filePath: file.path,
        });
        data.publicUrl = credentialFilePath;
      }
      await manager.getRepository(Credential).update(credential.id, data);
      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Cập nhật giấy tờ thành công',
      );
    });
  }

  async deleteCredential(id: number): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const credential = await manager.getRepository(Credential).findOne({
        where: { id: id },
        relations: ['coach', 'coach.user'],
      });
      if (!credential) throw new NotFoundException('Credential not found');
      if (credential.coach.user.id !== this.request.user.id) {
        throw new BadRequestException('You are not authorized to delete this');
      }
      await manager.getRepository(Credential).softDelete(credential.id);
      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Xóa giấy tờ thành công',
      );
    });
  }

  async restoreCredential(id: number): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const credential = await manager.getRepository(Credential).findOne({
        where: { id: id },
        withDeleted: true,
        relations: ['coach', 'coach.user'],
      });
      if (!credential) throw new NotFoundException('Credential not found');
      if (credential.coach.user.id !== this.request.user.id) {
        throw new BadRequestException('You are not authorized to restore this');
      }
      await manager.getRepository(Credential).restore(credential.id);
      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Khôi phục giấy tờ thành công',
      );
    });
  }

  async verifyCoach(coachId: number): Promise<void> {
    return await this.datasource.transaction(async (manager) => {
      const coach = await this.coachRepository.findOne({
        where: { id: coachId },
        relations: ['user'],
      });
      if (!coach) throw new NotFoundException('Coach not found');

      await this.coachRepository.update(coachId, {
        verificationStatus: CoachVerificationStatus.VERIFIED,
      });

      if (!coach.user.isActive) {
        await manager
          .getRepository(User)
          .update(coach.user.id, { isActive: true });
      }
    });
  }

  async rejectCoach(coachId: number, reason?: string): Promise<void> {
    return await this.datasource.transaction(async (manager) => {
      const coach = await manager.getRepository(Coach).findOne({
        where: { id: coachId },
      });
      if (!coach) throw new NotFoundException('Coach not found');

      await manager.getRepository(Coach).update(coachId, {
        verificationStatus: CoachVerificationStatus.REJECTED,
        verificationReason: reason,
      });

      return;
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
