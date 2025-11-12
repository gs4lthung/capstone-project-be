import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { PlatformAnalysisService } from '../services/platform-analysis.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MonthlyResponseDto } from '@app/shared/dtos/coaches/coach.dto';
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
    @Param('month') month: number,
    @Param('year') year: number,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
    return this.platformAnalysisService.getMonthlyNewUsers({
      month,
      year,
    });
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
    @Param('month') month: number,
    @Param('year') year: number,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
    return this.platformAnalysisService.getMonthlyLearnerPayment({
      month,
      year,
    });
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
    @Param('month') month: number,
    @Param('year') year: number,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
    return this.platformAnalysisService.getMonthlyCoachSessionEarning({
      month,
      year,
    });
  }

  @Get('revenue/monthly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Platform Analysis'],
    summary: 'Get monthly platform revenue',
    description: 'Get monthly platform revenue',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Monthly platform revenue',
  })
  async getMonthlyPlatformRevenue(
    @Param('month') month: number,
    @Param('year') year: number,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
    return this.platformAnalysisService.getMonthlyPlatformRevenue({
      month,
      year,
    });
  }
}
