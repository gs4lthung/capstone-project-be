import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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

  @Get('courses/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Feedbacks'],
    summary: 'Get feedbacks by course ID',
    description: 'Retrieve all feedbacks for a specific course',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feedbacks retrieved successfully',
  })
  @CheckRoles(UserRole.LEARNER, UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async getByCourseId(@Param('id') courseId: number) {
    return this.feedbackService.findByCourseId(courseId);
  }

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

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Feedbacks'],
    summary: 'Update existing feedback',
    description: 'Update feedback comment, rating, and anonymity option',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feedback updated successfully',
  })
  @CheckRoles(UserRole.LEARNER)
  @UseGuards(AuthGuard, RoleGuard)
  async update(
    @Param('id') feedbackId: number,
    @Body() data: CreateFeedbackDto,
  ) {
    return this.feedbackService.update(feedbackId, data);
  }
}
