import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Scope,
  Inject,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach, PaginatedCoach } from '@app/database/entities/coach.entity';
import { User } from '@app/database/entities/user.entity';
import { Credential } from '@app/database/entities/credential.entity';
import { CoachVerificationStatus } from '@app/shared/enums/coach.enum';
import { RegisterCoachDto } from '@app/shared/dtos/coaches/register-coach.dto';
import { Role } from '@app/database/entities/role.entity';
import { AuthProvider } from '@app/database/entities/auth-provider.entity';
import { AuthProviderEnum } from '@app/shared/enums/auth.enum';
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
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    super(coachRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginatedCoach> {
    return super.find(findOptions, 'coach', PaginatedCoach);
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

  async getCoachOverallRating(): Promise<CustomApiResponse<number>> {
    const feedbacks = await this.feedbackRepository.find({
      where: {
        receivedBy: this.request.user as User,
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

  async registerCoach(data: RegisterCoachDto): Promise<Coach> {
    // Check email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại');
    }

    // Check coach profile already exists (if user exists)
    const existed = await this.coachRepository.findOne({
      where: { user: { email: data.email } },
    });
    if (existed) throw new BadRequestException('Coach profile already exists');

    // Hash password
    const passwordHashed = await bcrypt.hash(
      data.password,
      this.configService.get('password_salt_rounds'),
    );

    // Get COACH role
    const coachRole = await this.roleRepository.findOne({
      where: { name: UserRole.COACH },
    });
    if (!coachRole) {
      throw new BadRequestException('Coach role not found');
    }

    // Create email verification token
    const emailVerificationToken = await this.jwtService.signAsync(
      { email: data.email },
      {
        secret: this.configService.get('jwt').verify_email_token.secret,
        expiresIn: this.configService.get('jwt').verify_email_token.expiration,
      },
    );

    // Create new user with COACH role
    const newUser = this.userRepository.create({
      fullName: data.fullName,
      email: data.email,
      password: passwordHashed,
      role: coachRole,
      authProviders: [
        {
          provider: AuthProviderEnum.LOCAL,
          providerId: data.email,
        } as AuthProvider,
      ],
      emailVerificationToken,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Create coach profile
    const coach = this.coachRepository.create({
      bio: data.bio,
      specialties: data.specialties,
      teachingMethods: data.teachingMethods,
      yearOfExperience: data.yearOfExperience,
      verificationStatus: CoachVerificationStatus.UNVERIFIED,
      user: savedUser,
    });

    const savedCoach = await this.coachRepository.save(coach);

    if (data.credentials && data.credentials.length > 0) {
      const credentials = data.credentials.map((c) =>
        this.credentialRepository.create({
          name: c.name,
          description: c.description,
          type: c.type,
          publicUrl: c.publicUrl,
          coach: savedCoach,
        }),
      );
      await this.credentialRepository.save(credentials);
      savedCoach.credentials = credentials;
    }

    return savedCoach;
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
}
