import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LearnerVideo } from '@app/database/entities/learner-video.entity';
import { FfmpegService } from '@app/ffmpeg';
import { UploadLearnerVideoDto } from '@app/shared/dtos/files/file.dto';
import { User } from '@app/database/entities/user.entity';

import { AiVideoComparisonResult } from '@app/database/entities/ai-video-comparison-result.entity';
import { LearnerProgress } from '@app/database/entities/learner-progress.entity';
import { LearnerVideoStatus } from '@app/shared/enums/learner.enum';
import { BunnyService } from '@app/bunny';
import { FileUtils } from '@app/shared/utils/file.util';
import { buildDetailsArrayFromComparison } from '@app/shared/helpers/buildDetailArray.helper';
import { SaveAiFeedbackDto } from '@app/shared/dtos/ai-feedback/ai-feedback.dto';
import { Video } from '@app/database/entities/video.entity';

@Injectable()
export class LearnerVideoService {
  constructor(
    @InjectRepository(LearnerVideo)
    private readonly learnerVideoRepo: Repository<LearnerVideo>,
    @InjectRepository(LearnerProgress)
    private readonly learnerProgressRepo: Repository<LearnerProgress>,
    @InjectRepository(AiVideoComparisonResult)
    private readonly aiVideoComparisonResultRepo: Repository<AiVideoComparisonResult>,
    private readonly ffmpegService: FfmpegService,
    private readonly bunnyService: BunnyService,
    private readonly datasource: DataSource,
  ) {}

  async upload(
    videoFile: Express.Multer.File,
    data: UploadLearnerVideoDto,
    user: Pick<User, 'id'>,
  ): Promise<LearnerVideo> {
    return this.datasource.transaction(async (manager) => {
      if (!videoFile) throw new BadRequestException('No video file uploaded');

      const thumbnailPath = await this.ffmpegService.createVideoThumbnailVer2(
        videoFile.path,
        FileUtils.excludeFileFromPath(videoFile.path),
      );

      const thumbnailPublicUrl = await this.bunnyService.uploadToStorage({
        id: Date.now(),
        type: 'video_thumbnail',
        filePath: thumbnailPath,
      });

      const encodeH264FilePath = await this.ffmpegService.transcodeToH264Aac(
        videoFile.path,
        FileUtils.excludeFileFromPath(videoFile.path),
      );

      const videoPublicUrl = await this.bunnyService.uploadToStorage({
        id: Date.now(),
        type: 'video',
        filePath: encodeH264FilePath,
      });

      const learnerVideo = manager.getRepository(LearnerVideo).create({
        publicUrl: videoPublicUrl,
        thumbnailUrl: thumbnailPublicUrl,
        duration: data.duration,
        tags: data.tags,
        status: LearnerVideoStatus.READY,
        user: { id: user.id },
        session: data.sessionId ? { id: data.sessionId } : undefined,
        video: data.coachVideoId ? { id: data.coachVideoId } : undefined,
      });

      return await manager.getRepository(LearnerVideo).save(learnerVideo);
    });
  }

  async findAll(filter: {
    lessonId?: number;
    sessionId?: number;
    userId?: number;
  }) {
    const where: any = {};
    if (filter.lessonId) {
      where.session = { lesson: { id: filter.lessonId } };
    }
    if (filter.sessionId) {
      where.session = { ...(where.session || {}), id: filter.sessionId };
    }
    if (filter.userId) {
      where.user = { id: filter.userId };
    }
    return this.learnerVideoRepo.find({
      where,
      relations: ['user', 'session', 'session.lesson'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneFull(id: number) {
    return this.learnerVideoRepo.findOne({
      where: { id },
      relations: [
        'user',
        'session',
        'session.lesson',
        'session.lesson.video',
        'aiVideoComparisonResults',
        'aiVideoComparisonResults.video',
      ],
    });
  }

  async saveAiFeedback(learnerVideoId: number, aiFeedback: SaveAiFeedbackDto) {
    const learnerVideo = await this.learnerVideoRepo.findOne({
      where: { id: learnerVideoId },
      relations: ['session', 'session.lesson', 'session.lesson.video'],
    });
    if (!learnerVideo) throw new BadRequestException('LearnerVideo not found');
    const coachVideo = learnerVideo.session?.lesson?.video as Video;
    const aiResultRecord: any = {
      learnerVideo,
    };

    // Only set video if it exists
    if (coachVideo) {
      aiResultRecord.video = coachVideo;
    }

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

    const createdRecord =
      this.aiVideoComparisonResultRepo.create(aiResultRecord);

    // Only update learner progress if learnerScore is provided
    if (
      aiFeedback.overallScoreForPlayer2 !== undefined &&
      aiFeedback.overallScoreForPlayer2 !== null
    ) {
      const learnerProgress = await this.learnerProgressRepo.findOne({
        where: {
          user: {
            learner: {
              id: learnerVideo.user.id,
            },
          },
          course: { sessions: { id: learnerVideo.session.id } },
        },
      });
      if (learnerProgress) {
        learnerProgress.avgAiAnalysisScore = Math.round(
          (learnerProgress.avgAiAnalysisScore +
            aiFeedback.overallScoreForPlayer2) /
            (await this.learnerVideoRepo.count({
              where: {
                user: { id: learnerVideo.user.id },
                session: { course: { id: learnerProgress.course.id } },
              },
            })),
        );
        await this.learnerProgressRepo.save(learnerProgress);
      }
    }

    return this.aiVideoComparisonResultRepo.save(createdRecord);
  }

  async generateOverlayVideo(
    learnerVideoId: number,
    coachVideoId: number,
  ): Promise<string> {
    return this.datasource.transaction(async (manager) => {
      const learnerVideo = await manager.getRepository(LearnerVideo).findOne({
        where: { id: learnerVideoId },
        relations: ['session', 'session.lesson', 'session.lesson.video'],
      });
      if (!learnerVideo)
        throw new BadRequestException('LearnerVideo not found');

      const coachVideo = await manager.getRepository(Video).findOne({
        where: { id: coachVideoId },
      });
      if (!coachVideo) throw new BadRequestException('Coach Video not found');

      const overlayFilePath = await this.ffmpegService.overlayVideoOnVideo(
        learnerVideo.publicUrl,
        coachVideo.publicUrl,
      );

      const thumbnail = await this.ffmpegService.createVideoThumbnailVer2(
        overlayFilePath,
        FileUtils.excludeFileFromPath(overlayFilePath),
      );

      const uploadedResult = await this.bunnyService.uploadToStorage({
        id: learnerVideo.id,
        type: 'video',
        filePath: overlayFilePath,
      });

      const uploadedThumbnail = await this.bunnyService.uploadToStorage({
        id: learnerVideo.id,
        type: 'video_thumbnail',
        filePath: thumbnail,
      });

      learnerVideo.overlayVideoUrl = uploadedResult;
      learnerVideo.overlayThumbnailUrl = uploadedThumbnail;
      await manager.getRepository(LearnerVideo).save(learnerVideo);

      return uploadedResult;
    });
  }
}
