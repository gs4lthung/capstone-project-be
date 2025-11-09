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
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NotificationService } from './notification.service';
import { NotificationType } from '@app/shared/enums/notification.enum';
import { AttendanceStatus } from '@app/shared/enums/attendance.enum';

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
    private readonly notificationService: NotificationService,
    private readonly datasource: DataSource,
  ) {
    super(quizRepository);
  }

  async getQuizzesByLesson(lessonId: number): Promise<Quiz[]> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      withDeleted: false,
    });
    if (!lesson) throw new BadRequestException('Không tìm thấy bài học');

    return this.quizRepository.find({
      where: { lesson: { id: lessonId } },
      relations: ['questions', 'questions.options', 'createdBy'],
      withDeleted: false,
    });
  }

  async createLessonQuiz(
    lessonId: number,
    data: CreateQuizDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
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
      await manager.getRepository(Lesson).save(lesson);

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'LESSON.QUIZ_CREATE_SUCCESS',
      );
    });
  }

  async createSessionQuiz(
    sessionId: number,
    data: CreateQuizDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
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
      await manager.getRepository(Session).save(session);

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'SESSION.QUIZ_CREATE_SUCCESS',
      );
    });
  }

  async update(
    id: number,
    data: CreateQuizDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const quiz = await this.quizRepository.findOne({
        where: { id: id },
        relations: ['session', 'session.course', 'lesson', 'createdBy'],
        withDeleted: false,
      });
      if (!quiz) throw new BadRequestException('Quiz not found');
      if (quiz.createdBy.id !== this.request.user.id)
        throw new ForbiddenException('Không có quyền truy cập quiz này');

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

      await manager.getRepository(Quiz).update(quiz.id, data);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'LESSON.QUIZ_UPDATE_SUCCESS',
      );
    });
  }

  async delete(id: number): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const quiz = await this.quizRepository.findOne({
        where: { id: id },
        relations: ['session', 'session.course', 'lesson', 'createdBy'],
        withDeleted: false,
      });
      if (!quiz) throw new BadRequestException('Quiz not found');
      if (quiz.createdBy.id !== this.request.user.id)
        throw new ForbiddenException('Không có quyền truy cập quiz này');

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
      await manager.getRepository(Quiz).softDelete(quiz);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'LESSON.QUIZ_DELETE_SUCCESS',
      );
    });
  }

  async restore(id: number): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const quiz = await this.quizRepository.findOne({
        where: { id: id },
        relations: ['createdBy'],
        withDeleted: true,
      });
      if (!quiz) throw new BadRequestException('Quiz not found');
      if (quiz.createdBy.id !== this.request.user.id)
        throw new ForbiddenException('Không có quyền truy cập quiz này');

      await manager.getRepository(Quiz).restore(quiz);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'LESSON.QUIZ_RESTORE_SUCCESS',
      );
    });
  }

  async learnerAttemptQuiz(quizId: number, data: LearnerAttemptQuizDto) {
    return await this.datasource.transaction(async (manager) => {
      const quiz = await this.quizRepository.findOne({
        where: { id: quizId },
        withDeleted: false,
        relations: ['questions', 'questions.options', 'session'],
      });
      if (!quiz) throw new BadRequestException('Quiz not found');
      if (!quiz.session)
        throw new BadRequestException('Quiz không thuộc về buổi học nào');

      const session = await this.sessionRepository.findOne({
        where: { id: quiz.session.id },
        relations: [
          'quizAttempts',
          'course',
          'course.enrollments',
          'course.createdBy',
          'attendances',
        ],
        withDeleted: false,
      });
      if (!session)
        throw new BadRequestException(
          'Buổi học không tồn tại hoặc bạn không được đăng ký buổi học này',
        );
      if (session.status !== SessionStatus.COMPLETED) {
        throw new BadRequestException(
          'Bạn chỉ có thể làm bài quiz cho các buổi học đã hoàn thành',
        );
      }
      if (
        !session.course.enrollments.some(
          (enrollment) => enrollment.user.id === (this.request.user as User).id,
        )
      ) {
        throw new BadRequestException(
          'Bạn không được đăng ký khóa học cho buổi học này',
        );
      }
      if (
        session.attendances &&
        !session.attendances.some(
          (att) =>
            att.user.id === (this.request.user as User).id &&
            att.status !== AttendanceStatus.ABSENT,
        )
      ) {
        throw new BadRequestException(
          'Bạn không thể làm bài quiz vì đã vắng mặt trong buổi học này',
        );
      }

      let correctAnswers = 0;
      for (const answer of data.learnerAnswers) {
        const question = quiz.questions.find((q) => q.id === answer.question);
        if (!question) {
          throw new BadRequestException(
            `Câu hỏi với ID ${answer.question} không tồn tại trong bài quiz`,
          );
        }
        const selectedOption = question.options.find(
          (opt) => opt.id === answer.questionOption,
        );
        if (!selectedOption) {
          throw new BadRequestException(
            `Lựa chọn với ID ${answer.questionOption} không tồn tại trong câu hỏi ${answer.question}`,
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
        attemptNumber: session.quizAttempts
          ? session.quizAttempts.length + 1
          : 1,
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
      await manager.getRepository(QuizAttempt).save(quizAttempt);

      const learnerProgress = await manager
        .getRepository(LearnerProgress)
        .findOne({
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
        await manager.getRepository(LearnerProgress).save(learnerProgress);
      }

      await this.notificationService.sendNotification({
        userId: session.course.createdBy.id,
        title: 'Học viên hoàn thành bài quiz',
        body: `Một học viên đã hoàn thành bài quiz`,
        navigateTo: `/coach/courses/${session.course.id}/quizzes/${quiz.id}/results`,
        type: NotificationType.INFO,
      });

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'QUIZ.ATTEMPT_SUCCESS',
      );
    });
  }
}
