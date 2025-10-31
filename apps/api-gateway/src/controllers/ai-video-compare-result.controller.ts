import { Controller, Get, Query, Param } from '@nestjs/common';
import { AiVideoCompareResultService } from '../services/ai-video-compare-result.service';

@Controller('ai-video-compare-results')
export class AiVideoCompareResultController {
  constructor(private readonly aiService: AiVideoCompareResultService) {}

  @Get()
  async getAllByLearnerVideo(@Query('learnerVideoId') learnerVideoId: number) {
    return this.aiService.findAllByLearnerVideoId(learnerVideoId);
  }

  @Get(':id')
  async getById(@Param('id') id: number) {
    return this.aiService.findById(id);
  }
}
