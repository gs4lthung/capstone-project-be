import { AwsService } from '@app/aws';
import {
  PaginatedSubject,
  Subject,
} from '@app/database/entities/subject.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
} from '@app/shared/dtos/subjects/subject.dto';
import { SubjectStatus } from '@app/shared/enums/subject.enum';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
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
import { DataSource, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class SubjectService extends BaseTypeOrmService<Subject> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly awsService: AwsService,
    private readonly datasource: DataSource,
  ) {
    super(subjectRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginatedSubject> {
    return super.find(findOptions, 'subject', PaginatedSubject);
  }

  async findOne(id: number): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { id: id },
      withDeleted: false,
      relations: ['courses', 'lessons'],
    });

    if (!subject) throw new Error('Subject not found');

    return subject;
  }

  async create(
    data: CreateSubjectDto,
    file: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      let publicUrl: string | undefined = undefined;
      if (file) {
        publicUrl = await this.awsService
          .uploadFileToPublicBucket({
            file: {
              buffer: file.buffer,
              ...file,
            },
          })
          .then((res) => res.url);
      }
      const newSubject = this.subjectRepository.create({
        ...data,
        createdBy: this.request.user as User,
        status: SubjectStatus.DRAFT,
        publicUrl: publicUrl,
      } as Subject);

      await manager.getRepository(Subject).save(newSubject);

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'SUBJECT.CREATE_SUCCESS',
      );
    });
  }

  async update(
    id: number,
    data: UpdateSubjectDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const subject = await this.subjectRepository.findOne({
        where: { id: id },
        withDeleted: false,
        relations: ['createdBy'],
      });
      if (!subject) throw new BadRequestException('Không tìm thấy khóa học');
      if (subject.createdBy.id !== this.request.user.id)
        throw new ForbiddenException('Không có quyền truy cập chủ đề này');

      if (data.status === SubjectStatus.PUBLISHED) {
        for (const lesson of subject.lessons) {
          if (
            !lesson.videos ||
            lesson.videos.length === 0 ||
            !lesson.quizzes ||
            lesson.quizzes.length === 0
          ) {
            throw new BadRequestException(
              'Không thể xuất bản chủ đề khi còn bài học chưa có video hoặc quiz',
            );
          }
        }

        await manager.getRepository(Subject).update(subject.id, data);

        return new CustomApiResponse<void>(
          HttpStatus.OK,
          'SUBJECT.UPDATE_SUCCESS',
        );
      }
    });
  }

  async delete(id: number): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const subject = await this.subjectRepository.findOne({
        where: { id: id },
        relations: ['createdBy'],
        withDeleted: false,
      });
      if (!subject) throw new BadRequestException('Subject not found');
      if (subject.createdBy.id !== this.request.user.id)
        throw new ForbiddenException('Không có quyền truy cập chủ đề này');

      await manager.getRepository(Subject).softDelete(subject.id);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'SUBJECT.DELETE_SUCCESS',
      );
    });
  }

  async restore(id: number): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const subject = await this.subjectRepository.findOne({
        where: { id: id },
        withDeleted: true,
      });
      if (!subject) throw new BadRequestException('Subject not found');
      await manager.getRepository(Subject).restore(subject.id);
      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'SUBJECT.RESTORE_SUCCESS',
      );
    });
  }
}
