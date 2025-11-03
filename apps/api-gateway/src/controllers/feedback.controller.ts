import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from '../services/feedback.service';
import { CreateFeedbackDto } from '@app/shared/dtos/feedbacks/feedback.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@Controller('feedbacks')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('courses/:id')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Feedbacks'],
    summary: 'Submit feedback for a completed course',
    description:
      'Submit feedback including comment, rating, and anonymity option',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Feedback submitted successfully',
  })
  @CheckRoles(UserRole.LEARNER)
  @UseGuards(AuthGuard, RoleGuard)
  async create(@Param('id') courseId: number, @Body() data: CreateFeedbackDto) {
    return this.feedbackService.create(courseId, data);
  }
}
