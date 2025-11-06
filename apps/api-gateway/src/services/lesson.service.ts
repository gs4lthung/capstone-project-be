import { Lesson } from '@app/database/entities/lesson.entity';
import { Subject } from '@app/database/entities/subject.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  CreateLessonRequestDto,
  UpdateLessonDto,
} from '@app/shared/dtos/lessons/lesson.dto';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
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
export class LessonService extends BaseTypeOrmService<Lesson> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly datasource: DataSource,
  ) {
    super(lessonRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginateObject<Lesson>> {
    return super.find(findOptions, 'lesson', PaginateObject<Lesson>);
  }

  async create(
    subjectId: number,
    data: CreateLessonRequestDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const subject = await this.subjectRepository.findOne({
        where: { id: subjectId },
        withDeleted: false,
      });
      if (!subject) throw new BadRequestException('Không tìm thấy khóa học');
      if (subject.createdBy.id !== this.request.user.id)
        throw new ForbiddenException('Không có quyền truy cập khóa học này');

      const newLesson = this.lessonRepository.create({
        ...data,
        lessonNumber: subject.lessons ? subject.lessons.length + 1 : 1,
        subject: subject as Subject,
      });
      await manager.getRepository(Lesson).save(newLesson);

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'LESSON.CREATE_SUCCESS',
      );
    });
  }

  async update(
    id: number,
    data: UpdateLessonDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const lesson = await this.lessonRepository.findOne({
        where: { id: id },
        withDeleted: false,
        relations: ['subject', 'subject.createdBy'],
      });
      if (!lesson) throw new BadRequestException('Không tìm thấy bài học');
      if (lesson.subject.createdBy.id !== this.request.user.id)
        throw new ForbiddenException('Không có quyền truy cập bài học này');

      await manager.getRepository(Lesson).update(lesson.id, { ...data });

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'LESSON.UPDATE_SUCCESS',
      );
    });
  }

  async delete(id: number): Promise<CustomApiResponse<void>> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: id },
      withDeleted: false,
      relations: ['subject', 'subject.createdBy'],
    });
    if (!lesson) throw new BadRequestException('Không tìm thấy bài học');
    if (lesson.subject.createdBy.id !== this.request.user.id)
      throw new ForbiddenException('Không có quyền truy cập bài học này');
    await this.lessonRepository.softDelete(lesson.id);

    return new CustomApiResponse<void>(HttpStatus.OK, 'LESSON.DELETE_SUCCESS');
  }

  async restore(id: number): Promise<CustomApiResponse<void>> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: id },
      relations: ['subject', 'subject.createdBy'],
      withDeleted: true,
    });
    if (!lesson) throw new BadRequestException('Không tìm thấy bài học');
    if (lesson.subject.createdBy.id !== this.request.user.id)
      throw new ForbiddenException('Không có quyền truy cập bài học này');
    await this.lessonRepository.restore(lesson.id);

    return new CustomApiResponse<void>(HttpStatus.OK, 'LESSON.RESTORE_SUCCESS');
  }
}
