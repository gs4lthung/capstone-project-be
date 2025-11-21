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
  CreateQuestionDto,
  CreateQuizDto,
  LearnerAttemptQuizDto,
  UpdateQuestionDto,
  UpdateQuizDto,
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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QuestionOption } from '@app/database/entities/question-option.entity';
import { Question } from '@app/database/entities/question.entity';

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
    private readonly eventEmitter: EventEmitter2,
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

  async getQuizzesBySession(sessionId: number): Promise<Quiz[]> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      withDeleted: false,
    });
    if (!session) throw new BadRequestException('Không tìm thấy buổi học');

    return this.quizRepository.find({
      where: { session: { id: sessionId } },
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
          'Không thể tạo quiz cho các buổi học thuộc khóa học chưa diễn ra',
        );
      if (
        session.status !== SessionStatus.SCHEDULED &&
        session.status !== SessionStatus.COMPLETED
      )
        throw new BadRequestException(
          'Không thể tạo quiz cho các buổi học chưa lên lịch hoặc đã bị hủy',
        );

      session.quizzes.push({
        ...data,
        totalQuestions: data.questions.length,
        createdBy: this.request.user as User,
      } as Quiz);
      await manager.getRepository(Session).save(session);

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'Tạo quiz thành công',
      );
    });
  }

  async createQuestion(quizId: number, data: CreateQuestionDto) {
    return await this.datasource.transaction(async (manager) => {
      console.log('Creating question with data:', data);
      const quiz = await this.quizRepository.findOne({
        where: { id: quizId },
        relations: ['session', 'lesson'],
        withDeleted: false,
      });
      if (!quiz) throw new BadRequestException('Quiz not found');
      if (quiz.session) {
        if (quiz.session.course.status !== CourseStatus.ON_GOING)
          throw new BadRequestException(
            'Không thể thêm câu hỏi cho quiz của các buổi học thuộc khóa học chưa diễn ra',
          );
        if (
          quiz.session.status !== SessionStatus.SCHEDULED &&
          quiz.session.status !== SessionStatus.COMPLETED
        )
          throw new BadRequestException(
            'Không thể thêm câu hỏi cho quiz của các buổi học chưa lên lịch hoặc đã bị hủy',
          );
      }

      quiz.questions.push(data as Question);
      quiz.totalQuestions = quiz.questions.length;
      await manager.getRepository(Quiz).save(quiz);
    });
  }

  async update(
    id: number,
    data: UpdateQuizDto,
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
        if (
          quiz.session.course.status !== CourseStatus.ON_GOING &&
          quiz.session.course.status !== CourseStatus.APPROVED &&
          quiz.session.course.status !== CourseStatus.READY_OPENED &&
          quiz.session.course.status !== CourseStatus.FULL
        )
          throw new BadRequestException('Không thể cập nhật quiz');
        if (
          quiz.session.status !== SessionStatus.SCHEDULED &&
          quiz.session.status !== SessionStatus.PENDING
        )
          throw new BadRequestException('Không thể cập nhật quiz');
      }

      await manager.getRepository(Quiz).update(quiz.id, data);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'LESSON.QUIZ_UPDATE_SUCCESS',
      );
    });
  }

  async updateQuestion(
    quizId: number,
    questionId: number,
    data: UpdateQuestionDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const quiz = await this.quizRepository.findOne({
        where: { id: quizId },
        relations: ['session', 'lesson'],
        withDeleted: false,
      });
      if (!quiz) throw new BadRequestException('Quiz not found');
      if (quiz.session) {
        if (
          quiz.session.course.status !== CourseStatus.ON_GOING &&
          quiz.session.course.status !== CourseStatus.APPROVED &&
          quiz.session.course.status !== CourseStatus.READY_OPENED &&
          quiz.session.course.status !== CourseStatus.FULL
        )
          throw new BadRequestException('Không thể cập nhật quiz');
        if (
          quiz.session.status !== SessionStatus.SCHEDULED &&
          quiz.session.status !== SessionStatus.PENDING
        )
          throw new BadRequestException('Không thể cập nhật quiz');
      }
      const questionIndex = quiz.questions.findIndex(
        (q) => q.id === questionId,
      );
      if (questionIndex === -1) {
        throw new BadRequestException('Question not found in the quiz');
      }

      const existingQuestion = quiz.questions[questionIndex];

      for (const option of existingQuestion.options) {
        const optionIndex = (data.options as QuestionOption[])?.findIndex(
          (opt) => opt.id === option.id,
        );
        if (optionIndex === -1) {
          // Option has been removed
          await manager.getRepository(QuestionOption).delete(option.id);
        }
        if (optionIndex !== -1) {
          // Option is being updated
          await manager
            .getRepository(QuestionOption)
            .update(option.id, (data.options as QuestionOption[])[optionIndex]);
        }
      }

      existingQuestion.title = data.title ?? existingQuestion.title;
      existingQuestion.explanation =
        data.explanation ?? existingQuestion.explanation;

      await manager.getRepository(Question).save(existingQuestion);
      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Cập nhật câu hỏi thành công',
      );
    });
  }

  async deleteQuestion(questionId: number): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const question = await manager.getRepository(Question).findOne({
        where: { id: questionId },
        relations: ['quiz', 'quiz.session', 'quiz.session.course'],
        withDeleted: false,
      });
      if (!question) throw new BadRequestException('Question not found');

      const totalQuestions = await manager.getRepository(Question).count({
        where: { quiz: { id: question.quiz.id } },
      });
      if (totalQuestions <= 1) {
        throw new BadRequestException(
          'Không thể xóa câu hỏi. Một quiz phải có ít nhất một câu hỏi.',
        );
      }

      if (question.quiz.session) {
        if (
          question.quiz.session.course.status !== CourseStatus.ON_GOING &&
          question.quiz.session.course.status !== CourseStatus.APPROVED &&
          question.quiz.session.course.status !== CourseStatus.READY_OPENED &&
          question.quiz.session.course.status !== CourseStatus.FULL
        )
          throw new BadRequestException('Không thể cập nhật question.quiz');
        if (
          question.quiz.session.status !== SessionStatus.SCHEDULED &&
          question.quiz.session.status !== SessionStatus.PENDING
        )
          throw new BadRequestException('Không thể cập nhật quiz');
      }

      await manager.getRepository(Quiz).update(question.quiz.id, {
        totalQuestions: totalQuestions - 1,
      });
      await manager.getRepository(Question).delete(questionId);
      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Xóa câu hỏi thành công',
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

      const totalQuizzes = await this.quizRepository.count({
        where: quiz.session
          ? { session: { id: quiz.session.id } }
          : { lesson: { id: quiz.lesson.id } },
      });
      if (totalQuizzes <= 1) {
        throw new BadRequestException(
          'Không thể xóa quiz. Một buổi học hoặc bài học phải có ít nhất một quiz.',
        );
      }

      if (quiz.session) {
        if (
          quiz.session.course.status !== CourseStatus.ON_GOING &&
          quiz.session.course.status !== CourseStatus.APPROVED &&
          quiz.session.course.status !== CourseStatus.READY_OPENED &&
          quiz.session.course.status !== CourseStatus.FULL
        )
          throw new BadRequestException('Không thể cập nhật quiz');
        if (
          quiz.session.status !== SessionStatus.SCHEDULED &&
          quiz.session.status !== SessionStatus.PENDING
        )
          throw new BadRequestException('Không thể cập nhật quiz');
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

  async findQuizAttempts(quizId: number): Promise<QuizAttempt[]> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['session'],
      withDeleted: false,
    });
    if (!quiz) throw new BadRequestException('Quiz not found');
    if (!quiz.session)
      throw new BadRequestException('Quiz không thuộc về buổi học nào');
    return this.quizAttemptRepository.find({
      where: { session: { id: quiz.session.id } },
      relations: [
        'attemptedBy',
        'learnerAnswers',
        'learnerAnswers.question',
        'learnerAnswers.questionOption',
      ],
      withDeleted: false,
    });
  }

  async learnerAttemptQuiz(quizId: number, data: LearnerAttemptQuizDto) {
    return await this.datasource.transaction(async (manager) => {
      const quiz = await this.quizRepository.findOne({
        where: { id: quizId },
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
          'attendances.user',
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

      const score = Number(
        ((correctAnswers / quiz.totalQuestions) * 100).toFixed(2),
      );

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
            (await manager.getRepository(QuizAttempt).count({
              where: {
                attemptedBy: { id: (this.request.user as User).id },
                session: { course: { id: session.course.id } },
              },
            })),
        );
        await manager.getRepository(LearnerProgress).save(learnerProgress);

        // ═══════════════════════════════════════════════════════════════════
        // EMIT EVENT: quiz.completed
        // ═══════════════════════════════════════════════════════════════════
        // Emit event để Achievement Tracking Service track quiz completion
        this.eventEmitter.emit('quiz.completed', {
          userId: (this.request.user as User).id,
          quizId: quiz.id,
          sessionId: session.id,
          courseId: session.course.id,
          score,
          avgQuizScore: learnerProgress.avgQuizScore,
        });
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
        'Đã nộp bài quiz thành công',
      );
    });
  }
}
