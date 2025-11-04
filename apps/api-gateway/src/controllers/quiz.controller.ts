import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { QuizService } from '../services/quiz.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import {
  CreateQuizDto,
  LearnerAttemptQuizDto,
} from '@app/shared/dtos/quizzes/quiz.dto';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('lessons/:id')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Quizzes'],
    summary: 'Create a new lesson quiz',
    description: 'Create a new lesson quiz',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lesson quiz created successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async createLessonQuiz(@Param('id') id: number, @Body() data: CreateQuizDto) {
    return this.quizService.createLessonQuiz(id, data);
  }

  @Post(':id/attempts')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Quizzes'],
    summary: 'Learner attempts a quiz',
    description: 'Learner attempts a quiz',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Quiz attempt created successfully',
  })
  @CheckRoles(UserRole.LEARNER)
  @UseGuards(AuthGuard, RoleGuard)
  async learnerAttemptQuiz(
    @Param('id') id: number,
    @Body('sessionId') sessionId: number,
    @Body() data: LearnerAttemptQuizDto,
  ) {
    return this.quizService.learnerAttemptQuiz(id, sessionId, data);
  }
}
