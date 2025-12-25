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
import { LearnerProgress } from '@app/database/entities/learner-progress.entity';

@Injectable()
export class AiVideoCompareResultService {
  constructor(
    @InjectRepository(AiVideoComparisonResult)
    private readonly aiRepo: Repository<AiVideoComparisonResult>,
    private readonly datasource: DataSource,
    private readonly notificationService: NotificationService,
  ) {}

  async findAllByLearnerVideoId(learnerVideoId: number) {
    return await this.datasource.transaction(async (manager) => {
      const learnerVideo = await manager
        .getRepository(LearnerVideo)
        .createQueryBuilder('learnerVideo')
        .leftJoinAndSelect('learnerVideo.user', 'user')
        .where('learnerVideo.id = :learnerVideoId', { learnerVideoId })
        .orderBy('learnerVideo.score', 'ASC')
        .getOne();
      if (!learnerVideo) {
        throw new BadRequestException('LearnerVideo not found');
      }
      return;
    });
  }

  async findAllByUserId(userId: number) {
    return this.aiRepo.find({
      where: { learnerVideo: { user: { id: userId } },status:'USED' },
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

  async update(id:number, aiFeedback: SaveAiFeedbackDto) {
    return await this.datasource.transaction(async (manager) => {
      console.log('[UpdateAiFeedback] Updating AiVideoComparisonResult with id:', id);
      const aiResultRecord = await manager.getRepository(AiVideoComparisonResult).findOne({ where: { id } });
      if (!aiResultRecord) {
        throw new BadRequestException('AiVideoComparisonResult not found');
      }
      if(aiResultRecord.status==='USED'){
        throw new BadRequestException('Không thể sử dụng khi mà đã sử dụng');
      }
      if(aiFeedback.coachNote){
        aiResultRecord.coachNote = aiFeedback.coachNote;
      }
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
      return await manager.getRepository(AiVideoComparisonResult).save(aiResultRecord);
    });
  }

  async save(
    id:number,
    aiFeedback: SaveAiFeedbackDto,
  ) {
    return await this.datasource.transaction(async (manager) => {
     const aiResultRecord = await manager.getRepository(AiVideoComparisonResult).findOne({ where: { id },relations: ['learnerVideo','learnerVideo.user'] });  
     if (!aiResultRecord) {
       throw new BadRequestException('AiVideoComparisonResult not found');
     }
      aiResultRecord.status = 'USED';
      aiResultRecord.coachNote=aiFeedback.coachNote;

      const learnerProgress=await manager.getRepository(LearnerProgress).findOne({ where: { user: aiResultRecord.learnerVideo.user } });
      if(!learnerProgress){
        throw new BadRequestException('LearnerProgress not found');
      }

      const previousAiResultsCount=await manager.getRepository(AiVideoComparisonResult).count({ where: { learnerVideo: aiResultRecord.learnerVideo,status:'USED' } });
      const previousAvg=learnerProgress.avgAiAnalysisScore||0
        const newAvg =
          (previousAvg * previousAiResultsCount + aiFeedback.overallScoreForPlayer2) /
          (previousAiResultsCount + 1);

      learnerProgress.avgAiAnalysisScore=newAvg;
      await manager.getRepository(LearnerProgress).save(learnerProgress);

      await this.notificationService.sendNotification({
        userId: aiResultRecord.learnerVideo.user.id,
        title: 'Video của bạn đã được phân tích bởi AI và HLV',
        body: `Video học viên của bạn đã được phân tích. Hãy xem phản hồi chi tiết để cải thiện kỹ năng của bạn!`,
        navigateTo: `/(learner)/ai`,
        type: NotificationType.INFO,
      });

      return await manager
        .getRepository(AiVideoComparisonResult)
        .save(aiResultRecord);
    });
  }
}
