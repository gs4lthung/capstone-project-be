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
import { WalletTransaction } from '@app/database/entities/wallet-transaction.entity';
import { Enrollment } from '@app/database/entities/enrollment.entity';
import { Session } from '@app/database/entities/session.entity';
import { Course } from '@app/database/entities/course.entity';
import { JwtPayloadDto } from '@app/shared/dtos/auth/jwt.payload.dto';
import { MailSendDto } from '@app/shared/dtos/mails/mail-send.dto';
import { MailService } from './mail.service';
import { TwilioService } from '@app/twilio';

@Injectable({ scope: Scope.REQUEST })
export class CoachService extends BaseTypeOrmService<Coach> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    private readonly configService: ConfigService,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly jwtService: JwtService,
    private readonly datasource: DataSource,
    private readonly mailService: MailService,
    private readonly twilioService: TwilioService,
  ) {
    super(coachRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginateObject<Coach>> {
    return super.find(findOptions, 'coach', PaginateObject<Coach>);
  }

  async findOne(id: number): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: { id: id },
      withDeleted: false,
      relations: ['user', 'credentials'],
    });

    if (!coach) throw new Error('Coach not found');

    return coach;
  }

  async getOverallRating(id: number): Promise<CustomApiResponse<number>> {
    const feedbacks = await this.feedbackRepository.find({
      where: {
        receivedBy: { id: id },
      },
    });
    if (feedbacks.length === 0)
      return new CustomApiResponse<number>(
        HttpStatus.OK,
        'No feedbacks found',
        0,
      );
    const totalRating = feedbacks.reduce(
      (acc, feedback) => acc + feedback.rating,
      0,
    );
    const overallRating = totalRating / feedbacks.length;
    return new CustomApiResponse<number>(
      HttpStatus.OK,
      'Success',
      overallRating,
    );
  }

  async registerCoach(
    data: RegisterCoachDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      let existingUser: User;
      if (data.email) {
        existingUser = await this.userRepository.findOne({
          where: { email: data.email },
        });
        if (existingUser) {
          throw new BadRequestException('Email đã tồn tại');
        }
      }

      if (data.phoneNumber) {
        existingUser = await this.userRepository.findOne({
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

      const coachRole = await this.roleRepository.findOne({
        where: { name: UserRole.COACH },
      });
      if (!coachRole) {
        throw new BadRequestException('Coach role not found');
      }

      const newUser = this.userRepository.create({
        fullName: data.fullName,
        email: data.email ? data.email : null,
        phoneNumber: data.phoneNumber ? data.phoneNumber : null,
        password: passwordHashed,
        role: coachRole,
        coach: [
          {
            ...(data.coach as Coach),
          },
        ],
      });

      if (data.email) {
        const payload: JwtPayloadDto = {
          id: newUser.id,
        };
        const emailVerificationToken = await this.jwtService.signAsync(
          payload,
          {
            secret: this.configService.get('jwt').verify_email_token.secret,
            expiresIn:
              this.configService.get('jwt').verify_email_token.expiration,
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
      const coach = await this.coachRepository.findOne({
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
  async verifyCoach(coachId: number): Promise<void> {
    const coach = await this.coachRepository.findOne({
      where: { id: coachId },
      relations: ['user'],
    });
    if (!coach) throw new NotFoundException('Coach not found');

    await this.coachRepository.update(coachId, {
      verificationStatus: CoachVerificationStatus.VERIFIED,
    });

    if (!coach.user.isActive) {
      await this.userRepository.update(coach.user.id, { isActive: true });
    }
  }

  async rejectCoach(coachId: number, reason?: string): Promise<void> {
    const coach = await this.coachRepository.findOne({
      where: { id: coachId },
    });
    if (!coach) throw new NotFoundException('Coach not found');

    await this.coachRepository.update(coachId, {
      verificationStatus: CoachVerificationStatus.REJECTED,
      verificationReason: reason,
    });

    return;
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
