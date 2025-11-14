import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import * as path from 'path';
import * as fs from 'fs';

// Define upload root directory (must match actual Multer storage configuration)
import { CreateVideoDto } from '@app/shared/videos/video.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { FileUtils } from '@app/shared/utils/file.util';
import { AwsService } from '@app/aws';
import { FfmpegService } from '@app/ffmpeg';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from '@app/database/entities/lesson.entity';
import { DataSource, Repository } from 'typeorm';
import { CoachVideoStatus } from '@app/shared/enums/coach.enum';
import { Video } from '@app/database/entities/video.entity';
import { User } from '@app/database/entities/user.entity';
import { Session } from '@app/database/entities/session.entity';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { SessionStatus } from '@app/shared/enums/session.enum';
@Injectable({ scope: Scope.REQUEST })
export class VideoService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly awsService: AwsService,
    private readonly ffmpegService: FfmpegService,
    private readonly datasource: DataSource,
  ) {}

  async getVideosByLesson(lessonId: number): Promise<Video[]> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      withDeleted: false,
    });
    if (!lesson) throw new BadRequestException('Không tìm thấy bài học');

    return this.videoRepository.find({
      where: { lesson: { id: lessonId } },
      relations: ['uploadedBy'],
      withDeleted: false,
    });
  }

  async getVideosBySession(sessionId: number): Promise<Video[]> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      withDeleted: false,
    });
    if (!session) throw new BadRequestException('Không tìm thấy buổi học');

    return this.videoRepository.find({
      where: { session: { id: sessionId } },
      relations: ['uploadedBy'],
      withDeleted: false,
    });
  }

  async createLessonVideo(
    id: number,
    data: CreateVideoDto,
    videoFile: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const lesson = await this.lessonRepository.findOne({
        where: { id: id },
        withDeleted: false,
      });
      if (!lesson) throw new BadRequestException('Không tìm thấy bài học');

      const videoThumbnail = await this.ffmpegService.createVideoThumbnail(
        videoFile.path,
        FileUtils.excludeFileFromPath(videoFile.path),
      );

      const filePath =
        FileUtils.convertFilePathToExpressFilePath(videoThumbnail);

      if (typeof filePath !== 'string') {
        throw new BadRequestException('Invalid thumbnail file path');
      }

      const videoThumbnailPublicUrl =
        await this.awsService.uploadFileToPublicBucket({
          file: {
            buffer: fs.readFileSync(filePath),
            path: filePath,
            originalname: path.basename(filePath),
            mimetype: 'image/jpeg',
            size: fs.statSync(filePath).size,
            fieldname: 'video_thumbnail',
            destination: '',
            filename: '',
            encoding: '7bit',
          } as Express.Multer.File,
        });

      const videoPublicUrl = await this.awsService.uploadFileToPublicBucket({
        file: {
          buffer: fs.readFileSync(videoFile.path),
          ...videoFile,
        },
      });

      lesson.videos.push({
        ...data,
        publicUrl: videoPublicUrl.url,
        thumbnailUrl: videoThumbnailPublicUrl.url,
        status: CoachVideoStatus.READY,
        uploadedBy: this.request.user as User,
      } as Video);

      await manager.getRepository(Lesson).save(lesson);

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'LESSON.VIDEO_CREATE_SUCCESS',
      );
    });
  }

  async createSessionVideo(
    sessionId: number,
    data: CreateVideoDto,
    videoFile: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const session = await this.sessionRepository.findOne({
        where: { id: sessionId },
        relations: ['course'],
        withDeleted: false,
      });
      if (!session) throw new BadRequestException('Không tìm thấy buổi tập');
      if (session.course.status !== CourseStatus.ON_GOING) {
        throw new BadRequestException(
          'Không thể tải video lên cho các buổi học thuộc khóa học chưa diễn ra',
        );
      }
      if (session.status !== SessionStatus.SCHEDULED) {
        throw new BadRequestException(
          'Không thể tải video lên cho các buổi học chưa lên lịch',
        );
      }

      const videoThumbnail = await this.ffmpegService.createVideoThumbnail(
        videoFile.path,
        FileUtils.excludeFileFromPath(videoFile.path),
      );

      const filePath =
        FileUtils.convertFilePathToExpressFilePath(videoThumbnail);

      if (typeof filePath !== 'string') {
        throw new BadRequestException('Invalid thumbnail file path');
      }

      const videoThumbnailPublicUrl =
        await this.awsService.uploadFileToPublicBucket({
          file: {
            buffer: fs.readFileSync(filePath),
            path: filePath,
            originalname: path.basename(filePath),
            mimetype: 'image/jpeg',
            size: fs.statSync(filePath).size,
            fieldname: 'video_thumbnail',
            destination: '',
            filename: '',
            encoding: '7bit',
          } as Express.Multer.File,
        });

      const videoPublicUrl = await this.awsService.uploadFileToPublicBucket({
        file: {
          buffer: fs.readFileSync(videoFile.path),
          ...videoFile,
        },
      });

      session.videos.push({
        ...data,
        publicUrl: videoPublicUrl.url,
        thumbnailUrl: videoThumbnailPublicUrl.url,
        status: CoachVideoStatus.READY,
        uploadedBy: this.request.user as User,
      } as Video);

      await manager.getRepository(Session).save(session);

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'Đăng tải video thành công',
      );
    });
  }
}
