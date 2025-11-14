import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiVideoComparisonResult } from '@app/database/entities/ai-video-comparison-result.entity';

@Injectable()
export class AiVideoCompareResultService {
  constructor(
    @InjectRepository(AiVideoComparisonResult)
    private readonly aiRepo: Repository<AiVideoComparisonResult>,
  ) {}

  async findAllByLearnerVideoId(learnerVideoId: number) {
    return this.aiRepo.find({
      where: { learnerVideo: { id: learnerVideoId } },
      relations: ['video', 'learnerVideo'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number) {
    return this.aiRepo.findOne({
      where: { id },
      relations: ['video', 'learnerVideo'],
    });
  }

  async findBySessionIdAndUserId(sessionId: number, userId: number) {
    return this.aiRepo.find({
      where: {
        learnerVideo: {
          session: { id: sessionId },
          user: { id: userId },
        },
      },
      relations: [
        'video',
        'learnerVideo',
        'learnerVideo.session',
        'learnerVideo.user',
      ],
      order: { createdAt: 'DESC' },
    });
  }
}
