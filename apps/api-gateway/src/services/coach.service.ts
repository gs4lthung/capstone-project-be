import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Coach } from '@app/database/entities/coach.entity';
import { User } from '@app/database/entities/user.entity';
import { Credential } from '@app/database/entities/credential.entity';
import { CoachVerificationStatus } from '@app/shared/enums/coach.enum';
import { RegisterCoachDto } from '@app/shared/dtos/coaches/register-coach.dto';
import { Subject } from '@app/database/entities/subject.entity';
import { SubjectStatus } from '@app/shared/enums/subject.enum';

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async registerCoach(userId: number, data: RegisterCoachDto): Promise<Coach> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const existed = await this.coachRepository.findOne({
      where: { user: { id: userId } },
    });
    if (existed) throw new BadRequestException('Coach profile already exists');

    // VALIDATE ONLY subjects with status=PUBLISH may be selected
    if (data.subjectIds?.length) {
      const numValid = await this.userRepository.manager.count(Subject, {
        where: {
          id: In(data.subjectIds),
          status: SubjectStatus.PUBLISHED,
        },
      });
      if (numValid !== data.subjectIds.length) {
        throw new BadRequestException(
          'Chỉ được chọn subject có trạng thái publish!',
        );
      }
    }

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

  async verifyCoach(
    coachId: number,
    approvedSubjectIds?: number[],
  ): Promise<void> {
    const coach = await this.coachRepository.findOne({
      where: { id: coachId },
      relations: ['user'],
    });
    if (!coach) throw new NotFoundException('Coach not found');

    // Gán quyền sở hữu subject cho coach nếu có truyền approvedSubjectIds
    if (approvedSubjectIds && approvedSubjectIds.length > 0) {
      await this.subjectRepository.update(
        { id: In(approvedSubjectIds) },
        { createdBy: coach.user },
      );
    }

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
