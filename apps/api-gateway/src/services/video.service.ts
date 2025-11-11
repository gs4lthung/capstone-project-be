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
const UPLOAD_ROOT = path.resolve(__dirname, '../../../../uploads');
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
@Injectable({ scope: Scope.REQUEST })
export class VideoService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
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

      // Validate and normalize videoFile.path
      let normalizedPath;
      try {
        normalizedPath = fs.realpathSync(path.resolve(videoFile.path));
      } catch {
        throw new BadRequestException('Invalid uploaded file path');
      }
      if (!normalizedPath.startsWith(UPLOAD_ROOT)) {
        throw new BadRequestException('File path outside of upload directory');
      }

      const videoThumbnail = await this.ffmpegService.createVideoThumbnail(
        normalizedPath,
        FileUtils.excludeFileFromPath(normalizedPath),
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
          buffer: fs.readFileSync(normalizedPath),
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
}
