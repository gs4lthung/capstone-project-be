import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearnerVideo } from '@app/database/entities/learner-video.entity';
import { AwsService } from '@app/aws';
import { FfmpegService } from '@app/ffmpeg';
import { UploadLearnerVideoDto } from '@app/shared/dtos/files/file.dto';
import { User } from '@app/database/entities/user.entity';
import * as path from 'path';
import * as fs from 'fs';

// Set this to your upload directory; adapt as needed for your deployment/config
import { FileUtils } from '@app/shared/utils/file.util';
import { AiVideoComparisonResult } from '@app/database/entities/ai-video-comparison-result.entity';
import { Video } from '@app/database/entities/video.entity';
import { buildDetailsArrayFromComparison } from '@app/shared/helpers/buildDetailArray.helper';
import { LearnerProgress } from '@app/database/entities/learner-progress.entity';

@Injectable()
export class LearnerVideoService {
  constructor(
    @InjectRepository(LearnerVideo)
    private readonly learnerVideoRepo: Repository<LearnerVideo>,
    @InjectRepository(LearnerProgress)
    private readonly learnerProgressRepo: Repository<LearnerProgress>,
    @InjectRepository(AiVideoComparisonResult)
    private readonly aiVideoComparisonResultRepo: Repository<AiVideoComparisonResult>,
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
    private readonly awsService: AwsService,
    private readonly ffmpegService: FfmpegService,
  ) {}

  async upload(
    videoFile: Express.Multer.File,
    data: UploadLearnerVideoDto,
    user: Pick<User, 'id'>,
  ): Promise<LearnerVideo> {
    if (!videoFile) throw new BadRequestException('No video file uploaded');

    const videoPublicUrl = await this.awsService.uploadFileToPublicBucket({
      file: {
        buffer: fs.readFileSync(videoFile.path),
        ...videoFile,
      },
    });

    const learnerVideo = this.learnerVideoRepo.create({
      publicUrl: videoPublicUrl.url,
      duration: data.duration,
      tags: data.tags,
      user: { id: user.id },
      session: data.sessionId ? { id: data.sessionId } : undefined,
      video: data.coachVideoId ? { id: data.coachVideoId } : undefined,
    });

    return this.learnerVideoRepo.save(learnerVideo);
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

  async saveAiFeedback(learnerVideoId: number, aiText: any) {
    const learnerVideo = await this.learnerVideoRepo.findOne({
      where: { id: learnerVideoId },
      relations: ['session', 'session.lesson', 'session.lesson.videos'],
    });
    if (!learnerVideo) throw new BadRequestException('LearnerVideo not found');
    const coachVideo = learnerVideo.session?.lesson?.videos?.[0] as Video;
    const aiResultRecord = this.aiVideoComparisonResultRepo.create({
      learnerVideo,
      video: coachVideo,
      summary: aiText.summary,
      coachNote: aiText.coachNote,
      learnerScore: aiText.overallScoreForPlayer2,
      keyDifferents: aiText.keyDifferences,
      recommendationDrills: aiText.recommendationsForPlayer2?.map((r: any) => ({
        name: r.drill?.title,
        description: r.drill?.description,
        practiceSets: r.drill?.practice_sets,
      })),
      details: buildDetailsArrayFromComparison(aiText.comparison),
    });

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
        (learnerProgress.avgAiAnalysisScore + aiText.overallScoreForPlayer2) /
          (await this.learnerVideoRepo.count({
            where: {
              user: { id: learnerVideo.user.id },
              session: { course: { id: learnerProgress.course.id } },
            },
          })),
      );
      await this.learnerProgressRepo.save(learnerProgress);
    }

    return this.aiVideoComparisonResultRepo.save(aiResultRecord);
  }

  async generateOverlayVideo(learnerVideoId: number): Promise<string> {
    const learnerVideo = await this.learnerVideoRepo.findOne({
      where: { id: learnerVideoId },
      relations: ['session', 'session.lesson', 'session.lesson.video'],
    });
    if (!learnerVideo) throw new BadRequestException('LearnerVideo not found');

    const coachVideo = await this.videoRepo.findOne({
      where: {
        aiVideoComparisonResults: { learnerVideo: { id: learnerVideo.id } },
      },
    });
    if (!coachVideo) throw new BadRequestException('Coach Video not found');

    const overlayFilePath = await this.ffmpegService.overlayVideoOnVideo(
      learnerVideo.publicUrl,
      coachVideo.publicUrl,
      FileUtils.excludeFileFromPath(learnerVideo.publicUrl),
    );

    const uploadedResult = await this.awsService.uploadFileToPublicBucket({
      file: {
        buffer: fs.readFileSync(overlayFilePath),
        path: overlayFilePath,
        originalname: path.basename(overlayFilePath),
        mimetype: 'video/mp4',
        size: fs.statSync(overlayFilePath).size,
        fieldname: 'video_overlay',
        destination: '',
        filename: '',
        encoding: '7bit',
      } as Express.Multer.File,
    });

    learnerVideo.overlayVideoUrl = uploadedResult.url;
    await this.learnerVideoRepo.save(learnerVideo);

    return uploadedResult.url;
  }
}
