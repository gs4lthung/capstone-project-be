import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from '@app/database/entities/coach.entity';
import { User } from '@app/database/entities/user.entity';
import { Credential } from '@app/database/entities/credential.entity';
import { CoachVerificationStatus } from '@app/shared/enums/coach.enum';
import { RegisterCoachDto } from '@app/shared/dtos/coaches/register-coach.dto';

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
  ) {}

  async registerCoach(userId: number, data: RegisterCoachDto): Promise<Coach> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const existed = await this.coachRepository.findOne({
      where: { user: { id: userId } },
    });
    if (existed) throw new BadRequestException('Coach profile already exists');

    const coach = this.coachRepository.create({
      bio: data.bio,
      specialties: data.specialties,
      teachingMethods: data.teachingMethods,
      yearOfExperience: data.yearOfExperience,
      verificationStatus: CoachVerificationStatus.UNVERIFIED,
      user: user,
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
