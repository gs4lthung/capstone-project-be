import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { CreateVideoDto, UpdateVideoDto } from '@app/shared/videos/video.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
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
import { BunnyService } from '@app/bunny';
import { CryptoUtils } from '@app/shared/utils/crypto.util';
import { FileUtils } from '@app/shared/utils/file.util';
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
    private readonly ffmpegService: FfmpegService,
    private readonly bunnyService: BunnyService,
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

  async getVideoById(id: number): Promise<Video> {
    const video = await this.videoRepository.findOne({
      where: { id: id },
      relations: ['uploadedBy'],
      withDeleted: false,
    });
    if (!video) throw new BadRequestException('Không tìm thấy video');
    return video;
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

      const videoPublicUrl = await this.bunnyService.uploadToStorage({
        id: CryptoUtils.generateRandomNumber(1000000, 999999),
        filePath: videoFile.path,
        type: 'video',
      });

      lesson.videos.push({
        ...data,
        publicUrl: videoPublicUrl,
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
      const session = await manager.getRepository(Session).findOne({
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

      const thumbnail = await this.ffmpegService.createVideoThumbnailVer2(
        videoFile.path,
        FileUtils.excludeFileFromPath(videoFile.path),
      );

      const uploadedThumbnail = await this.bunnyService.uploadToStorage({
        id: CryptoUtils.generateRandomNumber(1000000, 999999),
        filePath: thumbnail,
        type: 'video_thumbnail',
      });

      const videoPublicUrl = await this.bunnyService.uploadToStorage({
        id: CryptoUtils.generateRandomNumber(1000000, 999999),
        filePath: videoFile.path,
        type: 'video',
      });

      session.videos.push({
        ...data,
        publicUrl: videoPublicUrl,
        thumbnailUrl: uploadedThumbnail,
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

  async updateVideo(
    id: number,
    data: UpdateVideoDto,
    videoFile?: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const video = await manager.getRepository(Video).findOne({
        where: { id: id },
        withDeleted: false,
      });
      if (!video) throw new BadRequestException('Không tìm thấy video');
      if (videoFile) {
        const thumnailUrl = await this.ffmpegService.createVideoThumbnailVer2(
          videoFile.path,
          FileUtils.excludeFileFromPath(videoFile.path),
        );
        const uploadedThumbnail = await this.bunnyService.uploadToStorage({
          id: CryptoUtils.generateRandomNumber(100_000, 999_999),
          filePath: thumnailUrl,
          type: 'video_thumbnail',
        });
        video.thumbnailUrl = uploadedThumbnail;
        const videoPublicUrl = await this.bunnyService.uploadToStorage({
          id: CryptoUtils.generateRandomNumber(100_000, 999_999),
          filePath: videoFile.path,
          type: 'video',
        });
        video.publicUrl = videoPublicUrl;
      }
      Object.assign(video, data);
      await manager.getRepository(Video).save(video);
      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Cập nhật video thành công',
      );
    });
  }

  async deleteVideo(id: number): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const video = await manager.getRepository(Video).findOne({
        where: { id: id },
        withDeleted: false,
      });
      if (!video) throw new BadRequestException('Không tìm thấy video');
      await manager.getRepository(Video).softDelete(video.id);
      return new CustomApiResponse<void>(HttpStatus.OK, 'Xóa video thành công');
    });
  }
}
