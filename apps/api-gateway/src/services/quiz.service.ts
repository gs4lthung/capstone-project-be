import { LearnerAnswer } from '@app/database/entities/learner-answer.entity';
import { LearnerProgress } from '@app/database/entities/learner-progress.entity';
import { Lesson } from '@app/database/entities/lesson.entity';
import { Quiz } from '@app/database/entities/quiz.entity';
import { QuizAttempt } from '@app/database/entities/quiz_attempt.entity';
import { Session } from '@app/database/entities/session.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  CreateQuizDto,
  LearnerAttemptQuizDto,
} from '@app/shared/dtos/quizzes/quiz.dto';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { SessionStatus } from '@app/shared/enums/session.enum';
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
    @InjectRepository(QuizAttempt)
    private readonly quizAttemptRepository: Repository<QuizAttempt>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(LearnerProgress)
    private readonly learnerProgressRepository: Repository<LearnerProgress>,
  ) {
    super(quizRepository);
  }

  async createLessonQuiz(
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

  async createSessionQuiz(
    sessionId: number,
    data: CreateQuizDto,
  ): Promise<CustomApiResponse<void>> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['course'],
      withDeleted: false,
    });
    if (!session) throw new BadRequestException('Session not found');
    if (session.course.status !== CourseStatus.ON_GOING)
      throw new BadRequestException(
        'Cannot create quiz for sessions whose course is not ongoing',
      );
    if (session.status !== SessionStatus.SCHEDULED)
      throw new BadRequestException(
        'Cannot create quiz for sessions that are not scheduled',
      );

    session.quizzes.push({
      ...data,
      totalQuestions: data.questions.length,
      createdBy: this.request.user as User,
    } as Quiz);
    await this.sessionRepository.save(session);

    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'SESSION.QUIZ_CREATE_SUCCESS',
    );
  }

  async update(
    id: number,
    data: CreateQuizDto,
  ): Promise<CustomApiResponse<void>> {
    const quiz = await this.quizRepository.findOne({
      where: { id: id },
      relations: ['session', 'session.course', 'lesson'],
      withDeleted: false,
    });
    if (!quiz) throw new BadRequestException('Quiz not found');

    if (quiz.session) {
      if (quiz.session.course.status !== CourseStatus.ON_GOING)
        throw new BadRequestException(
          'Cannot update quiz for sessions whose course is not ongoing',
        );
      if (quiz.session.status !== SessionStatus.SCHEDULED)
        throw new BadRequestException(
          'Cannot update quiz for sessions that are not scheduled',
        );
    }

    await this.quizRepository.update(quiz.id, data);

    return new CustomApiResponse<void>(
      HttpStatus.OK,
      'LESSON.QUIZ_UPDATE_SUCCESS',
    );
  }

  async delete(id: number): Promise<CustomApiResponse<void>> {
    const quiz = await this.quizRepository.findOne({
      where: { id: id },
      relations: ['session', 'session.course', 'lesson'],
      withDeleted: false,
    });
    if (!quiz) throw new BadRequestException('Quiz not found');

    if (quiz.session) {
      if (quiz.session.course.status !== CourseStatus.ON_GOING)
        throw new BadRequestException(
          'Cannot update quiz for sessions whose course is not ongoing',
        );
      if (quiz.session.status !== SessionStatus.SCHEDULED)
        throw new BadRequestException(
          'Cannot update quiz for sessions that are not scheduled',
        );
    }
    await this.quizRepository.softDelete(quiz);

    return new CustomApiResponse<void>(
      HttpStatus.OK,
      'LESSON.QUIZ_DELETE_SUCCESS',
    );
  }

  async restore(id: number): Promise<CustomApiResponse<void>> {
    const quiz = await this.quizRepository.findOne({
      where: { id: id },
      withDeleted: true,
    });
    if (!quiz) throw new BadRequestException('Quiz not found');
    await this.quizRepository.restore(quiz);

    return new CustomApiResponse<void>(
      HttpStatus.OK,
      'LESSON.QUIZ_RESTORE_SUCCESS',
    );
  }

  async learnerAttemptQuiz(quizId: number, data: LearnerAttemptQuizDto) {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      withDeleted: false,
      relations: ['questions', 'questions.options', 'session'],
    });
    if (!quiz) throw new BadRequestException('Quiz not found');
    if (!quiz.session)
      throw new BadRequestException('Quiz is not associated with any session');

    const session = await this.sessionRepository.findOne({
      where: { id: quiz.session.id },
      relations: ['quizAttempts', 'course', 'course.enrollments'],
      withDeleted: false,
    });
    if (!session)
      throw new BadRequestException(
        'Session not found or you are not enrolled in this session',
      );
    if (session.status !== SessionStatus.COMPLETED) {
      throw new BadRequestException(
        'You can only attempt the quiz for completed sessions',
      );
    }
    if (
      !session.course.enrollments.some(
        (enrollment) => enrollment.user.id === (this.request.user as User).id,
      )
    ) {
      throw new BadRequestException(
        'You are not enrolled in the course for this session',
      );
    }

    let correctAnswers = 0;
    for (const answer of data.learnerAnswers) {
      const question = quiz.questions.find((q) => q.id === answer.question);
      if (!question) {
        throw new BadRequestException(
          `Question with ID ${answer.question} not found in the quiz`,
        );
      }
      const selectedOption = question.options.find(
        (opt) => opt.id === answer.questionOption,
      );
      if (!selectedOption) {
        throw new BadRequestException(
          `Option with ID ${answer.questionOption} not found in question ${answer.question}`,
        );
      }
      if (selectedOption.isCorrect) {
        correctAnswers++;
        answer['isCorrect'] = true;
      }
    }

    const score = (correctAnswers / quiz.totalQuestions) * 100;

    const quizAttempt = this.quizAttemptRepository.create({
      session,
      attemptNumber: session.quizAttempts ? session.quizAttempts.length + 1 : 1,
      attemptedBy: this.request.user as User,
      score,
      learnerAnswers: data.learnerAnswers.map(
        (ans) =>
          ({
            question: { id: ans.question },
            questionOption: { id: ans.questionOption },
            isCorrect: ans['isCorrect'] || false,
          }) as LearnerAnswer,
      ),
    });
    await this.quizAttemptRepository.save(quizAttempt);

    const learnerProgress = await this.learnerProgressRepository.findOne({
      where: {
        user: this.request.user as User,
        course: session.course,
      },
      withDeleted: false,
    });
    if (learnerProgress) {
      learnerProgress.avgQuizScore = Math.round(
        (learnerProgress.avgQuizScore + score) /
          learnerProgress.sessionsCompleted,
      );
      await this.learnerProgressRepository.save(learnerProgress);
    }

    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'QUIZ.ATTEMPT_SUCCESS',
    );
  }
}
