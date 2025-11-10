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
import { FileUtils } from '@app/shared/utils/file.util';
import { AiVideoComparisonResult } from '@app/database/entities/ai-video-comparison-result.entity';
import { Video } from '@app/database/entities/video.entity';
import { buildDetailsArrayFromComparison } from '@app/shared/helpers/buildDetailArray.helper';

@Injectable()
export class LearnerVideoService {
  constructor(
    @InjectRepository(LearnerVideo)
    private readonly learnerVideoRepo: Repository<LearnerVideo>,
    @InjectRepository(AiVideoComparisonResult)
    private readonly aiVideoComparisonResultRepo: Repository<AiVideoComparisonResult>,
    private readonly awsService: AwsService,
    private readonly ffmpegService: FfmpegService,
  ) {}

  async upload(
    videoFile: Express.Multer.File,
    data: UploadLearnerVideoDto,
    user: Pick<User, 'id'>,
  ): Promise<LearnerVideo> {
    if (!videoFile) throw new BadRequestException('No video file uploaded');

    const videoThumbnail = await this.ffmpegService.createVideoThumbnail(
      videoFile.path,
      FileUtils.excludeFileFromPath(videoFile.path),
    );
    const thumbnailPath = String(
      FileUtils.convertFilePathToExpressFilePath(videoThumbnail),
    );
    const videoThumbnailPublicUrl =
      await this.awsService.uploadFileToPublicBucket({
        file: {
          buffer: fs.readFileSync(thumbnailPath),
          path: thumbnailPath,
          originalname: path.basename(thumbnailPath),
          mimetype: 'image/jpeg',
          size: fs.statSync(thumbnailPath).size,
          fieldname: 'video_thumbnail',
          destination: '',
          filename: '',
          encoding: '7bit',
          stream: undefined,
        } as unknown as Express.Multer.File,
      });

    const videoPublicUrl = await this.awsService.uploadFileToPublicBucket({
      file: {
        buffer: fs.readFileSync(videoFile.path),
        ...videoFile,
      },
    });

    const learnerVideo = this.learnerVideoRepo.create({
      publicUrl: videoPublicUrl.url,
      thumbnailUrl: videoThumbnailPublicUrl.url,
      duration: data.duration,
      tags: data.tags,
      user: { id: user.id },
      session: data.sessionId ? { id: data.sessionId } : undefined,
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
    return this.aiVideoComparisonResultRepo.save(aiResultRecord);
  }
}
