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
  UseInterceptors,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import {
  AiVideoCompareResultService,
  AiPoseService,
  AiGeminiService,
} from '@app/ai-video-compare-result';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import { SaveAiFeedbackDto } from '@app/shared/dtos/ai-feedback/ai-feedback.dto';

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
    return this.aiService.save(learnerVideoId, videoId, aiFeedback);
  }

  @Post('compare-videos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['AI Video Compare Results'],
    summary: 'Compare coach and learner videos using AI pose detection',
    description:
      'Upload two videos (coach and learner) and get AI-powered comparison with pose analysis',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        videos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description:
            'Two video files: [0] = coach video, [1] = learner video',
        },
        coachTimestamps: {
          type: 'string',
          description:
            'JSON array of timestamps for coach video (e.g., "[2.5, 5.0, 7.5]")',
        },
        learnerTimestamps: {
          type: 'string',
          description:
            'JSON array of timestamps for learner video (e.g., "[3.0, 6.0, 9.0]")',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('videos', 2))
  @UseGuards(AuthGuard, RoleGuard)
  @CheckRoles(UserRole.COACH)
  async compareVideos(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('coachTimestamps') coachTimestampsStr: string,
    @Body('learnerTimestamps') learnerTimestampsStr: string,
    @Body('coachVideoUrl') coachVideoUrl?: string,
    @Body('learnerVideoUrl') learnerVideoUrl?: string,
  ) {
    // Support both file upload and URL
    let coachBuffer: Buffer;
    let learnerBuffer: Buffer;

    if (coachVideoUrl && learnerVideoUrl) {
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

      coachBuffer = await downloadFromUrl(coachVideoUrl);
      learnerBuffer = await downloadFromUrl(learnerVideoUrl);
    } else if (files && files.length === 2) {
      // Use uploaded files
      const [coachFile, learnerFile] = files;

      // Helper function to get buffer from file
      const getVideoBuffer = async (
        file: Express.Multer.File,
      ): Promise<Buffer> => {
        if (file.buffer) {
          return file.buffer;
        }
        if (file.path) {
          return fs.readFileSync(file.path);
        }
        throw new BadRequestException('Invalid file: no buffer or path');
      };

      coachBuffer = await getVideoBuffer(coachFile);
      learnerBuffer = await getVideoBuffer(learnerFile);
    } else {
      throw new BadRequestException(
        'Phải cung cấp video files hoặc video URLs (coachVideoUrl và learnerVideoUrl)',
      );
    }

    if (!coachTimestampsStr || !learnerTimestampsStr) {
      throw new BadRequestException('Timestamps không được để trống');
    }

    let coachTimestamps: number[];
    let learnerTimestamps: number[];

    try {
      coachTimestamps = JSON.parse(coachTimestampsStr);
      learnerTimestamps = JSON.parse(learnerTimestampsStr);
    } catch (error) {
      console.log('❌ Error parsing timestamps:', error);
      throw new BadRequestException('Timestamps phải là JSON array hợp lệ');
    }

    if (!Array.isArray(coachTimestamps) || !Array.isArray(learnerTimestamps)) {
      throw new BadRequestException('Timestamps phải là array');
    }

    // Extract pose data from both videos
    let coachPoses: any[][];
    let learnerPoses: any[][];

    try {
      [coachPoses, learnerPoses] = await Promise.all([
        this.poseService.extractPosesFromVideo(coachBuffer, coachTimestamps),
        this.poseService.extractPosesFromVideo(
          learnerBuffer,
          learnerTimestamps,
        ),
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Invalid timestamps')) {
        throw new BadRequestException(
          `Lỗi timestamps: ${errorMessage}. Vui lòng kiểm tra lại timestamps không vượt quá độ dài video.`,
        );
      }
      throw new BadRequestException(
        `Lỗi xử lý video: ${errorMessage}. Vui lòng kiểm tra video có hợp lệ không.`,
      );
    }

    // Check if poses were detected
    const coachHasPoses = coachPoses.some((poses) => poses.length > 0);
    const learnerHasPoses = learnerPoses.some((poses) => poses.length > 0);

    if (!coachHasPoses) {
      throw new BadRequestException(
        'Không thể phát hiện tư thế trong video coach. Hãy thử video khác với người chơi được nhìn thấy rõ ràng.',
      );
    }

    if (!learnerHasPoses) {
      throw new BadRequestException(
        'Không thể phát hiện tư thế trong video learner. Hãy thử video khác với người chơi được nhìn thấy rõ ràng.',
      );
    }

    // Call Gemini API for comparison
    const analysis = await this.geminiService.comparePoseData(
      coachPoses,
      coachTimestamps,
      learnerPoses,
      learnerTimestamps,
    );

    // Return full result with poses for mobile to render skeletons
    return {
      ...analysis,
      coachPoses,
      learnerPoses,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: number) {
    return this.aiService.findById(id);
  }
}
