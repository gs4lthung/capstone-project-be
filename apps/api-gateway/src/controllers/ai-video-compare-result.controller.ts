import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
  Post,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import * as https from 'https';
import * as http from 'http';
import { SaveAiFeedbackDto } from '@app/shared/dtos/ai-feedback/ai-feedback.dto';
import { AiVideoCompareResultService } from '../services/ai-video-compare-result.service';
import { AiPoseService } from '../services/ai-pose.service';
import { AiGeminiService } from '../services/ai-gemini.service';

@Controller('ai-video-compare-results')
export class AiVideoCompareResultController {
  constructor(
    private readonly aiService: AiVideoCompareResultService,
    private readonly poseService: AiPoseService,
    private readonly geminiService: AiGeminiService,
  ) {}

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

  @Post(':learnerVideoId/save')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['AI Video Compare Results'],
    summary: 'Save AI video comparison result',
    description:
      'Save the AI analysis result for a learner video with optional coach note. videoId is optional - if not provided, will use video from learnerVideo session.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'AI comparison result saved successfully',
  })
  @UseGuards(AuthGuard, RoleGuard)
  @CheckRoles(UserRole.COACH)
  async saveResult(
    @Param('learnerVideoId') learnerVideoId: number,
    @Body('videoId') videoId: number | undefined,
    @Body() aiFeedback: SaveAiFeedbackDto,
  ) {
    const res = await this.aiService.save(learnerVideoId, videoId, aiFeedback);
    return res;
  }

  @Post('compare-videos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['AI Video Compare Results'],
    summary: 'Compare coach and learner videos using AI pose detection',
    description:
      'Upload two videos (coach and learner) and get AI-powered comparison with pose analysis',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async compareVideos(
    @Body('coachVideoUrl') coachVideoUrl: string,
    @Body('learnerVideoUrl') learnerVideoUrl: string,
    @Body('samplingRate') samplingRate?: number,
  ) {
    console.log(coachVideoUrl, learnerVideoUrl, samplingRate);
    // Support both file upload and URL
    let coachBuffer: Buffer;
    let learnerBuffer: Buffer;

    // Download from URLs
    const downloadFromUrl = (url: string): Promise<Buffer> => {
      return new Promise((resolve, reject) => {
        const client = url.startsWith('https://') ? https : http;
        client
          .get(url, (response) => {
            if (response.statusCode !== 200) {
              reject(
                new BadRequestException(
                  `Failed to download video: ${response.statusCode}`,
                ),
              );
              return;
            }
            const chunks: Buffer[] = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
          })
          .on('error', reject);
      });
    };

    // eslint-disable-next-line prefer-const
    coachBuffer = await downloadFromUrl(coachVideoUrl);
    // eslint-disable-next-line prefer-const
    learnerBuffer = await downloadFromUrl(learnerVideoUrl);

    const [coachResult, learnerResult] = await Promise.all([
      this.poseService.extractAllPosesFromVideo(coachBuffer, samplingRate),
      this.poseService.extractAllPosesFromVideo(learnerBuffer, samplingRate),
    ]);

    const analysis = await this.geminiService.comparePoseData(
      coachResult.poses,
      coachResult.timestamps,
      learnerResult.poses,
      learnerResult.timestamps,
    );

    // Return full result with poses for mobile to render skeletons
    return {
      ...analysis,
    };
  }

  @Get('users/:userId')
  @UseGuards(AuthGuard)
  async getAllByUserId(@Param('userId') userId: number) {
    return this.aiService.findAllByUserId(userId);
  }

  @Get(':id')
  async getById(@Param('id') id: number) {
    return this.aiService.findById(id);
  }
}
