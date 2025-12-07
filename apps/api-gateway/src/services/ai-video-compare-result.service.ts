import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AiVideoComparisonResult } from '@app/database/entities/ai-video-comparison-result.entity';
import { LearnerVideo } from '@app/database/entities/learner-video.entity';
import { Video } from '@app/database/entities/video.entity';
import { SaveAiFeedbackDto } from '@app/shared/dtos/ai-feedback/ai-feedback.dto';
import { buildDetailsArrayFromComparison } from '@app/shared/helpers/buildDetailArray.helper';
import { NotificationType } from '@app/shared/enums/notification.enum';
import { NotificationService } from './notification.service';

@Injectable()
export class AiVideoCompareResultService {
  constructor(
    @InjectRepository(AiVideoComparisonResult)
    private readonly aiRepo: Repository<AiVideoComparisonResult>,
    private readonly datasource: DataSource,
    private readonly notificationService: NotificationService,
  ) {}

  async findAllByLearnerVideoId(learnerVideoId: number) {
    return this.aiRepo.find({
      where: { learnerVideo: { id: learnerVideoId } },
      relations: ['video', 'learnerVideo'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByUserId(userId: number) {
    return this.aiRepo.find({
      where: { learnerVideo: { user: { id: userId } } },
      relations: [
        'video',
        'learnerVideo',
        'video.session',
        'video.session.course',
      ],
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

  async save(
    learnerVideoId: number,
    videoId: number | undefined,
    aiFeedback: SaveAiFeedbackDto,
  ) {
    return await this.datasource.transaction(async (manager) => {
      const learnerVideo = await manager
        .getRepository(LearnerVideo)
        .createQueryBuilder('learnerVideo')
        .leftJoinAndSelect('learnerVideo.user', 'user')
        .where('learnerVideo.id = :learnerVideoId', { learnerVideoId })
        .getOne();
      if (!learnerVideo) {
        throw new BadRequestException('LearnerVideo not found');
      }

      console.log('TEST', learnerVideo);
      const video = await manager
        .getRepository(Video)
        .createQueryBuilder('video')
        .where('video.id = :videoId', {
          videoId: videoId,
        })
        .getOne();
      if (!video) {
        throw new BadRequestException('Video not found');
      }

      const aiResultRecord: any = {};

      // Get video from videoId if provided, otherwise from learnerVideo session

      aiResultRecord.video = video;
      aiResultRecord.learnerVideo = learnerVideo;

      // Only set fields that have values
      if (aiFeedback.summary) {
        aiResultRecord.summary = aiFeedback.summary;
      }
      if (aiFeedback.coachNote !== undefined && aiFeedback.coachNote !== null) {
        aiResultRecord.coachNote = aiFeedback.coachNote;
      }
      if (
        aiFeedback.overallScoreForPlayer2 !== undefined &&
        aiFeedback.overallScoreForPlayer2 !== null
      ) {
        aiResultRecord.learnerScore = aiFeedback.overallScoreForPlayer2;
      }
      if (
        aiFeedback.keyDifferences &&
        Array.isArray(aiFeedback.keyDifferences) &&
        aiFeedback.keyDifferences.length > 0
      ) {
        aiResultRecord.keyDifferents = aiFeedback.keyDifferences.map((kd) => ({
          aspect: kd.aspect,
          impact: kd.impact,
          coachTechnique: kd.coachTechnique,
          learnerTechnique: kd.learnerTechnique,
        }));
      }
      if (
        aiFeedback.recommendationsForPlayer2 &&
        Array.isArray(aiFeedback.recommendationsForPlayer2) &&
        aiFeedback.recommendationsForPlayer2.length > 0
      ) {
        aiResultRecord.recommendationDrills =
          aiFeedback.recommendationsForPlayer2.map((r) => {
            const drill: any = {};
            if (r.drill?.title) {
              drill.name = r.drill.title;
            }
            if (r.drill?.description) {
              drill.description = r.drill.description;
            }
            if (r.drill?.practice_sets) {
              const practiceSets = r.drill.practice_sets as
                | string
                | string[]
                | number;
              drill.practiceSets =
                typeof practiceSets === 'string'
                  ? practiceSets
                  : Array.isArray(practiceSets)
                    ? practiceSets.join(', ')
                    : String(practiceSets || '');
            }
            return drill;
          });
      }
      if (aiFeedback.comparison) {
        const details = buildDetailsArrayFromComparison(aiFeedback.comparison);
        if (details && details.length > 0) {
          aiResultRecord.details = details;
        }
      }

      await this.notificationService.sendNotification({
        userId: learnerVideo.user.id,
        title: 'Video của bạn đã được phân tích bởi AI và HLV',
        body: `Video học viên của bạn đã được phân tích. Hãy xem phản hồi chi tiết để cải thiện kỹ năng của bạn!`,
        navigateTo: `/(learner)/ai`,
        type: NotificationType.INFO,
      });

      const createdRecord = manager
        .getRepository(AiVideoComparisonResult)
        .create(aiResultRecord);
      return await manager
        .getRepository(AiVideoComparisonResult)
        .save(createdRecord);
    });
  }
}
