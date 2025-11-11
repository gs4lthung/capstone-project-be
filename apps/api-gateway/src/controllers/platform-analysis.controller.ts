import { Body, Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { PlatformAnalysisService } from '../services/platform-analysis.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  MonthlyRequestDto,
  MonthlyResponseDto,
} from '@app/shared/dtos/coaches/coach.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';

@Controller('platform-analysis')
export class PlatformAnalysisController {
  constructor(
    private readonly platformAnalysisService: PlatformAnalysisService,
  ) {}

  @Get('new-users/monthly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Platform Analysis'],
    summary: 'Get monthly new user registrations',
    description: 'Get monthly new user registrations',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Monthly new user registrations',
  })
  async getMonthlyNewUsers(
    @Body() data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
    return this.platformAnalysisService.getMonthlyNewUsers(data);
  }

  @Get('learner-payments/monthly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Platform Analysis'],
    summary: 'Get monthly learner payments',
    description: 'Get monthly learner payments',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Monthly learner payments',
  })
  async getMonthlyLearnerPayments(
    @Body() data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
    return this.platformAnalysisService.getMonthlyLearnerPayment(data);
  }

  @Get('coach-earnings/monthly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Platform Analysis'],
    summary: 'Get monthly coach earnings',
    description: 'Get monthly coach earnings',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Monthly coach earnings',
  })
  async getMonthlyCoachEarnings(
    @Body() data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
    return this.platformAnalysisService.getMonthlyCoachSessionEarning(data);
  }
}
