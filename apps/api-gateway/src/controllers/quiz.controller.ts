import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
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

  @Get('lessons/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Quizzes'],
    summary: 'Get quizzes by lesson id',
    description: 'Get all quizzes of a lesson',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of quizzes',
  })
  @UseGuards(AuthGuard)
  async getQuizzesByLesson(@Param('id') id: number) {
    return this.quizService.getQuizzesByLesson(id);
  }

  @Get('sessions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Quizzes'],
    summary: 'Get quizzes by session id',
    description: 'Get all quizzes of a session',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of quizzes',
  })
  @UseGuards(AuthGuard)
  async getQuizzesBySession(@Param('id') id: number) {
    return this.quizService.getQuizzesBySession(id);
  }

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

  @Post('sessions/:id')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Quizzes'],
    summary: 'Create a new session quiz',
    description: 'Create a new session quiz',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Session quiz created successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async createSessionQuiz(
    @Param('id') id: number,
    @Body() data: CreateQuizDto,
  ) {
    return this.quizService.createSessionQuiz(id, data);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Quizzes'],
    summary: 'Update a session quiz',
    description: 'Update a session quiz',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session quiz updated successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async update(@Param('id') id: number, @Body() data: CreateQuizDto) {
    return this.quizService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Quizzes'],
    summary: 'Delete a  quiz',
    description: 'Delete a  quiz',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quiz deleted successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async delete(@Param('id') id: number) {
    return this.quizService.delete(id);
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Quizzes'],
    summary: 'Restore a deleted quiz',
    description: 'Restore a deleted quiz',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quiz restored successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async restore(@Param('id') id: number) {
    return this.quizService.restore(id);
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
    @Body() data: LearnerAttemptQuizDto,
  ) {
    return this.quizService.learnerAttemptQuiz(id, data);
  }
}
