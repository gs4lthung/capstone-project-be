import { AwsService } from '@app/aws';
import { Lesson } from '@app/database/entities/lesson.entity';
import { Subject } from '@app/database/entities/subject.entity';
import { User } from '@app/database/entities/user.entity';
import { FfmpegService } from '@app/ffmpeg';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CreateLessonRequestDto } from '@app/shared/dtos/lessons/lesson.dto';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FileUtils } from '@app/shared/utils/file.util';
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { CoachVideoStatus } from '@app/shared/enums/coach.enum';

@Injectable({ scope: Scope.REQUEST })
export class LessonService extends BaseTypeOrmService<Lesson> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly awsService: AwsService,
    private readonly ffmpegService: FfmpegService,
  ) {
    super(lessonRepository);
  }

  async create(
    subjectId: number,
    videoFile: Express.Multer.File,
    data: CreateLessonRequestDto,
  ): Promise<CustomApiResponse<void>> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
      withDeleted: false,
    });
    if (!subject) throw new BadRequestException('Không tìm thấy khóa học');
    if (subject.createdBy.id !== this.request.user.id)
      throw new ForbiddenException('Không có quyền truy cập khóa học này');

    const videoThumbnail = await this.ffmpegService.createVideoThumbnail(
      videoFile.path,
      FileUtils.excludeFileFromPath(videoFile.path),
    );

    const filePath = FileUtils.convertFilePathToExpressFilePath(videoThumbnail);

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

    const newLesson = this.lessonRepository.create({
      ...data,
      lessonNumber: subject.lessons ? subject.lessons.length + 1 : 1,
      subject: subject as Subject,
      video: {
        ...data.video,
        publicUrl: videoPublicUrl.url,
        thumbnailUrl: videoThumbnailPublicUrl.url,
        status: CoachVideoStatus.READY,
        uploadedBy: this.request.user as User,
      },
      quiz: {
        ...data.quiz,
        totalQuestions: data.quiz.questions.length,
        createdBy: this.request.user as User,
      },
    });
    await this.lessonRepository.save(newLesson);

    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'LESSON.CREATE_SUCCESS',
    );
  }
}
