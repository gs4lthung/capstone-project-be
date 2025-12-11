import { LearnerProgress } from '@app/database/entities/learner-progress.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AiGeminiService } from './ai-gemini.service';
import { Session } from '@app/database/entities/session.entity';
import { SessionStatus } from '@app/shared/enums/session.enum';
import { AiLearnerProgressAnalysisResponse } from '@app/shared/interfaces/ai-learner-progress-analysis.interface';
import { AiLearnerProgressAnalysis } from '@app/database/entities/ai-learner-progress-analysis.entity';

@Injectable({ scope: Scope.REQUEST })
export class LearnerProgressService extends BaseTypeOrmService<LearnerProgress> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(LearnerProgress)
    private readonly learnerProgressRepository: Repository<LearnerProgress>,
    private readonly datasource: DataSource,
    private readonly aiGeminiService: AiGeminiService,
  ) {
    super(learnerProgressRepository);
  }

  async findAll(
    findOptions: FindOptions,
  ): Promise<PaginateObject<LearnerProgress>> {
    return super.find(
      findOptions,
      'learnerProgress',
      PaginateObject<LearnerProgress>,
    );
  }

  async getProgressForCourse(
    courseStatus: CourseStatus,
  ): Promise<CustomApiResponse<LearnerProgress[]>> {
    return await this.datasource.transaction(async (manager) => {
      let progresses: LearnerProgress[] = [];
      progresses = await manager
        .getRepository(LearnerProgress)
        .createQueryBuilder('learnerProgress')
        .leftJoinAndSelect('learnerProgress.user', 'user')
        .leftJoinAndSelect('learnerProgress.course', 'course')
        .leftJoinAndSelect('course.createdBy', 'createdBy')
        .where('course.status = :courseStatus', { courseStatus })
        .andWhere('createdBy.id = :userId', { userId: this.request.user.id })
        .getMany();

      return new CustomApiResponse<LearnerProgress[]>(
        HttpStatus.OK,
        'Learner progresses retrieved successfully',
        progresses,
      );
    });
  }

  async getLearnerProgressDetails(
    userId: number,
    courseId: number,
  ): Promise<LearnerProgress> {
    return await this.datasource.transaction(async (manager) => {
      const progress = await manager
        .getRepository(LearnerProgress)
        .createQueryBuilder('learnerProgress')
        .leftJoinAndSelect('learnerProgress.user', 'user')
        .leftJoinAndSelect('learnerProgress.course', 'course')
        .leftJoinAndSelect('course.sessions', 'sessions')
        .leftJoinAndSelect('sessions.video', 'video')
        .leftJoinAndSelect('sessions.quiz', 'quiz')
        .leftJoinAndSelect('sessions.learnerVideos', 'learnerVideos')
        .leftJoinAndSelect('learnerVideos.user', 'learnerVideoUser')
        .andWhere('learnerVideoUser.id = :userId', { userId })
        .leftJoinAndSelect('quiz.questions', 'questions')
        .leftJoinAndSelect('questions.options', 'options')
        .leftJoinAndSelect('course.createdBy', 'createdBy')
        .where('user.id = :userId', { userId })
        .andWhere('course.id = :courseId', { courseId })
        .getOne();
      return progress;
    });
  }

  /**
   * Get AI-powered analysis of learner's progress with recommendations
   */
  async getAiProgressAnalysis(
    userId: number,
    courseId: number,
  ): Promise<CustomApiResponse<AiLearnerProgressAnalysisResponse>> {
    return await this.datasource.transaction(async (manager) => {
      // Get learner progress with all related data
      const progress = await manager
        .getRepository(LearnerProgress)
        .createQueryBuilder('learnerProgress')
        .leftJoinAndSelect('learnerProgress.user', 'user')
        .leftJoinAndSelect('learnerProgress.course', 'course')
        .where('user.id = :userId', { userId })
        .andWhere('course.id = :courseId', { courseId })
        .getOne();

      if (!progress) {
        throw new BadRequestException(
          'Không tìm thấy thông tin tiến độ học tập',
        );
      }

      // Get completed sessions with all details
      const completedSessions = await manager
        .getRepository(Session)
        .createQueryBuilder('session')
        .leftJoinAndSelect('session.quiz', 'quiz')
        .leftJoinAndSelect('quiz.questions', 'questions')
        .leftJoinAndSelect('questions.options', 'options')
        .leftJoinAndSelect('session.quizAttempts', 'quizAttempts')
        .leftJoinAndSelect('quizAttempts.attemptedBy', 'attemptedBy')
        .leftJoinAndSelect('quizAttempts.learnerAnswers', 'learnerAnswers')
        .leftJoinAndSelect('learnerAnswers.question', 'answerQuestion')
        .leftJoinAndSelect('learnerAnswers.questionOption', 'answerOption')
        .leftJoinAndSelect('session.learnerVideos', 'learnerVideos')
        .leftJoinAndSelect('learnerVideos.user', 'learnerVideoUser')
        .leftJoinAndSelect(
          'learnerVideos.aiVideoComparisonResults',
          'comparisonResults',
        )
        .where('session.course.id = :courseId', { courseId })
        .andWhere('session.status = :completedStatus', {
          completedStatus: SessionStatus.COMPLETED,
        })
        .andWhere('attemptedBy.id = :userId', { userId })
        .andWhere('learnerVideoUser.id = :userId', { userId })
        .orderBy('session.sessionNumber', 'ASC')
        .getMany();

      // Prepare data for AI analysis
      const completedSessionDetails = completedSessions.map((session) => {
        // Process quiz attempts for this session
        const quizAttempts = session.quizAttempts
          ?.filter((attempt) => attempt.attemptedBy.id === progress.user.id)
          .map((attempt) => {
            const wrongAnswers = attempt.learnerAnswers
              .filter((answer) => !answer.isCorrect)
              .map((answer) => ({
                questionTitle: answer.question.title,
                selectedAnswer: answer.questionOption.content,
                correctAnswer:
                  answer.question.options.find((opt) => opt.isCorrect)
                    ?.content || 'N/A',
              }));

            return {
              attemptNumber: attempt.attemptNumber,
              score: attempt.score,
              totalQuestions: session.quiz?.totalQuestions || 0,
              correctAnswers: attempt.learnerAnswers.filter(
                (ans) => ans.isCorrect,
              ).length,
              wrongAnswers,
            };
          });

        // Process video comparisons for this session
        const videoComparisons = session.learnerVideos
          ?.filter((lv) => lv.user.id === progress.user.id)
          .flatMap((learnerVideo) =>
            learnerVideo.aiVideoComparisonResults.map((result) => ({
              learnerScore: result.learnerScore,
              summary: result.summary,
              strengths: result.details.flatMap((d) => d.strengths || []),
              weaknesses: result.details.flatMap((d) => d.weaknesses || []),
              keyDifferences: result.keyDifferents.map((kd) => ({
                aspect: kd.aspect,
                impact: kd.impact,
              })),
            })),
          );

        return {
          sessionNumber: session.sessionNumber,
          sessionName: session.name || `Buổi ${session.sessionNumber}`,
          completedAt: session.completedAt,
          quizAttempts:
            quizAttempts && quizAttempts.length > 0 ? quizAttempts : undefined,
          videoComparisons:
            videoComparisons && videoComparisons.length > 0
              ? videoComparisons
              : undefined,
        };
      });

      // Call AI service for analysis
      const aiAnalysis = await this.aiGeminiService.analyzeLearnerProgress({
        learnerId: progress.user.id,
        learnerName: progress.user.fullName,
        courseName: progress.course.name,
        totalSessions: progress.totalSessions,
        completedSessions: progress.sessionsCompleted,
        completedSessionDetails,
      });

      // Save the analysis result to database
      const analysisEntity = manager
        .getRepository(AiLearnerProgressAnalysis)
        .create({
          overallSummary: aiAnalysis.overallSummary,
          progressPercentage: aiAnalysis.progressPercentage,
          strengthsIdentified: aiAnalysis.strengthsIdentified,
          areasForImprovement: aiAnalysis.areasForImprovement,
          quizPerformanceAnalysis: aiAnalysis.quizPerformanceAnalysis,
          videoPerformanceAnalysis: aiAnalysis.videoPerformanceAnalysis,
          recommendationsForNextSession:
            aiAnalysis.recommendationsForNextSession as any,
          practiceDrills: aiAnalysis.practiceDrills as any,
          motivationalMessage: aiAnalysis.motivationalMessage,
          sessionsCompletedAtAnalysis: progress.sessionsCompleted,
          totalSessionsAtAnalysis: progress.totalSessions,
          user: progress.user,
          learnerProgress: progress,
        });

      await manager
        .getRepository(AiLearnerProgressAnalysis)
        .save(analysisEntity);

      return new CustomApiResponse<AiLearnerProgressAnalysisResponse>(
        HttpStatus.OK,
        'Phân tích tiến độ học tập thành công',
        aiAnalysis,
      );
    });
  }
}
