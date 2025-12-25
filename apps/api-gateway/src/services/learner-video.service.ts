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
import { GeminiApiResponse } from '@app/shared/dtos/ai-feedback/ai-feedback.dto';

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

      const videoPublicUrl = await this.bunnyService.uploadToStorage({
        id: Date.now(),
        type: 'video',
        filePath: videoFile.path,
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
  async update(id:number,file:Express.Multer.File){
    if(!file)
      throw new BadRequestException('Không tìm thấy video');
    
    const learnerVideo=await this.learnerVideoRepo.findOne({where:{id},relations:['aiVideoComparisonResults'] })
    if(!learnerVideo)
      throw new BadRequestException('Không tìm thấy video');
    
    if(learnerVideo.aiVideoComparisonResults.length>0)
      throw new BadRequestException('Video đã được so sánh');

    const thumbnailPath = await this.ffmpegService.createVideoThumbnailVer2(
      file.path,
      FileUtils.excludeFileFromPath(file.path),
    );

    const thumbnailPublicUrl = await this.bunnyService.uploadToStorage({
      id: Date.now(),
      type: 'video_thumbnail',
      filePath: thumbnailPath,
    });

    const videoPublicUrl = await this.bunnyService.uploadToStorage({
      id: Date.now(),
      type: 'video',
      filePath: file.path,
    });

    learnerVideo.publicUrl=videoPublicUrl;
    learnerVideo.thumbnailUrl=thumbnailPublicUrl;
    return await this.learnerVideoRepo.save(learnerVideo)  
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
      relations: [
        'user',
        'session',
        'session.lesson',
        'aiVideoComparisonResults',
        'video',
      ],
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

  async findLearnerVideosByUser(userId: number, coachVideoId: number) {
    return this.learnerVideoRepo.find({
      where: { user: { id: userId }, video: { id: coachVideoId } },
      relations: ['aiVideoComparisonResults', 'video'],
      order: { createdAt: 'DESC' },
    });
  }

  async saveAiFeedback(learnerVideoId: number, aiFeedback: GeminiApiResponse) {
    return await this.datasource.transaction(async (manager) => {
      const learnerVideo = await manager.getRepository(LearnerVideo).findOne({
        where: { id: learnerVideoId },
        relations: ['video', 'user', 'session', 'session.course'],
      });
      if (!learnerVideo)
        throw new BadRequestException('LearnerVideo not found');


      if (!learnerVideo.session?.course) {
        throw new BadRequestException(
          'LearnerVideo session or course not found',
        );
      }

      const learnerProgress = await manager
        .getRepository(LearnerProgress)
        .findOne({
          where: {
            user: { id: learnerVideo.user.id },
            course: { id: learnerVideo.session.course.id },
          },
          relations: ['course'],
        });

      if (learnerProgress) {
        // Get the count of previous AI comparison results for this user and course
        const previousAiResultsCount = await manager
          .getRepository(AiVideoComparisonResult)
          .count({
            where: {
              learnerVideo: {
                user: { id: learnerVideo.user.id },
                session: { course: { id: learnerProgress.course.id } },
              },
            },
          });

        // Calculate the new average:
        // newAvg = ((previousAvg * previousCount) + newScore) / (previousCount + 1)
        const previousAvg = learnerProgress.avgAiAnalysisScore || 0;
        const newAvg =
          (previousAvg * previousAiResultsCount + aiFeedback.learnerScore) /
          (previousAiResultsCount + 1);

        learnerProgress.avgAiAnalysisScore = Math.floor(newAvg);
        await manager.getRepository(LearnerProgress).save(learnerProgress);
      }

      return manager.getRepository(AiVideoComparisonResult).save({
        ...aiFeedback,
        learnerVideo,
        video: learnerVideo.video,
      });
    });
  }
}
