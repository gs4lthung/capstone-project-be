import { Lesson } from '@app/database/entities/lesson.entity';
import { Quiz } from '@app/database/entities/quiz.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CreateQuizDto } from '@app/shared/dtos/quizzes/quiz.dto';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class QuizService extends BaseTypeOrmService<Quiz> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {
    super(quizRepository);
  }

  async create(
    lessonId: number,
    data: CreateQuizDto,
  ): Promise<CustomApiResponse<void>> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      withDeleted: false,
    });
    if (!lesson) throw new BadRequestException('Không tìm thấy bài học');

    lesson.quizzes.push({
      ...data,
      totalQuestions: data.questions.length,
      createdBy: this.request.user as User,
    } as Quiz);
    await this.lessonRepository.save(lesson);

    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'LESSON.QUIZ_CREATE_SUCCESS',
    );
  }
}
