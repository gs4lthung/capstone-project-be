import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LearnerService } from '../services/learner.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CreateLearnerProfileDto } from '@app/shared/dtos/users/learners/learner.dto';

@Controller('learners')
export class LearnerController {
  constructor(private readonly learnerService: LearnerService) {}

  @Post('profiles')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Learners'],
    summary: 'Create Learner Profile',
    description: 'Create a learner profile for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Learner profile created successfully',
  })
  @UseGuards(AuthGuard)
  async createLearnerProfile(
    @Body() data: CreateLearnerProfileDto,
  ): Promise<CustomApiResponse<void>> {
    return this.learnerService.createLearnerProfile(data);
  }
}
