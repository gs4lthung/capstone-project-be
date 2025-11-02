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
import { CreateQuizDto } from '@app/shared/dtos/quizzes/quiz.dto';

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
    return this.quizService.create(id, data);
  }
}
