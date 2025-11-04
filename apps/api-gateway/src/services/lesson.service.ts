import { Lesson, PaginatedLesson } from '@app/database/entities/lesson.entity';
import { Subject } from '@app/database/entities/subject.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CreateLessonRequestDto } from '@app/shared/dtos/lessons/lesson.dto';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
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
import { FindOptions } from '@app/shared/interfaces/find-options.interface';

@Injectable({ scope: Scope.REQUEST })
export class LessonService extends BaseTypeOrmService<Lesson> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {
    super(lessonRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginatedLesson> {
    return super.find(findOptions, 'lesson', PaginatedLesson);
  }

  async create(
    subjectId: number,
    data: CreateLessonRequestDto,
  ): Promise<CustomApiResponse<void>> {
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
    await this.lessonRepository.save(newLesson);

    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'LESSON.CREATE_SUCCESS',
    );
  }
}
