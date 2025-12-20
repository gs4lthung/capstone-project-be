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
      aiResultRecord.status = 'USED';

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
