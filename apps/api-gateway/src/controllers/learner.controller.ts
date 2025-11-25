import { Controller, Get, UseGuards } from '@nestjs/common';
import { LearnerService } from '../services/learner.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('learners')
export class LearnerController {
  constructor(private readonly learnerService: LearnerService) {}

  @Get('total-courses')
  @UseGuards(AuthGuard)
  async getTotalCourses() {
    return this.learnerService.getTotalCourses();
  }

  @Get('total-ai-feedbacks')
  @UseGuards(AuthGuard)
  async getTotalAiFeedbacks() {
    return this.learnerService.getTotalAiFeedbacks();
  }

  @Get('current-progresses')
  @UseGuards(AuthGuard)
  async getCurrentLearnerProgresses() {
    return this.learnerService.getCurrentLearnerProgresses();
  }
}
