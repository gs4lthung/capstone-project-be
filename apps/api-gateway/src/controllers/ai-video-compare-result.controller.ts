import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AiVideoCompareResultService } from '../services/ai-video-compare-result.service';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';

@Controller('ai-video-compare-results')
export class AiVideoCompareResultController {
  constructor(private readonly aiService: AiVideoCompareResultService) {}

  @Get()
  async getAllByLearnerVideo(@Query('learnerVideoId') learnerVideoId: number) {
    return this.aiService.findAllByLearnerVideoId(learnerVideoId);
  }

  @Get('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['AI Video Compare Results'],
    summary: 'Get coach feedback by session',
    description:
      'Get all AI video comparison results (coach feedback) for learner videos in a specific session',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coach feedback retrieved successfully',
  })
  @UseGuards(AuthGuard, RoleGuard)
  @CheckRoles(UserRole.LEARNER)
  async getBySession(
    @Param('sessionId') sessionId: number,
    @Req() req: CustomApiRequest,
  ) {
    const userId = Number(req.user.id);
    return this.aiService.findBySessionIdAndUserId(sessionId, userId);
  }

  @Get(':id')
  async getById(@Param('id') id: number) {
    return this.aiService.findById(id);
  }
}
