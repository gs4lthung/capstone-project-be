import { LearnerProfile } from '@app/database/entities/learner-profile.entity';
import { Role } from '@app/database/entities/role.entity';
import { User } from '@app/database/entities/user.entity';
import { RedisService } from '@app/redis';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { CreateLearnerProfileDto } from '@app/shared/dtos/users/learners/learner.dto';
import { PickleBallAssessMethod } from '@app/shared/enums/pickleball.enum';
import { UserRole } from '@app/shared/enums/user.enum';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LearnerServiceService {
  constructor(
    @InjectRepository(LearnerProfile)
    private readonly learnerProfileRepository: Repository<LearnerProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly redisService: RedisService,
  ) {}
  async createLearnerProfile(
    userId: number,
    data: CreateLearnerProfileDto,
  ): Promise<CustomApiResponse<void>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        withDeleted: false,
      });
      if (!user)
        throw new CustomRpcException('NOT_FOUND', HttpStatus.NOT_FOUND);

      if (user.learnerProfile || user.coachProfile)
        throw new CustomRpcException(
          'LEARNER_PROFILE_ALREADY_EXISTS',
          HttpStatus.BAD_REQUEST,
        );

      const learnerRole = await this.roleRepository.findOneBy({
        name: UserRole.LEARNER,
      });

      await this.userRepository.save({
        ...user,
        role: learnerRole,
        learnerProfile: {
          ...data,
          skillAssessment: {
            assessedLevel: data.pickleballLevel,
            method: PickleBallAssessMethod.SELF_ASSESSMENT,
          },
        },
      });

      await this.redisService.del(`user:${userId}`);
      await this.redisService.delByPattern('users*');

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'LEARNER_PROFILE_CREATE_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
