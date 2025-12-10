import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { PlatformAnalysisService } from '../services/platform-analysis.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  AnalysisResponseDto,
  AnalysisType,
} from '@app/shared/dtos/coaches/coach.dto';
import { DashboardOverviewDto } from '@app/shared/dtos/platform-analysis/dashboard-overview.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';

@Controller('platform-analysis')
export class PlatformAnalysisController {
  constructor(
    private readonly platformAnalysisService: PlatformAnalysisService,
  ) {}

  @Get('new-users/:type')
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
    @Param('type') type: AnalysisType,
    @Query('month') month: number,
    @Query('year') year: number,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    return this.platformAnalysisService.getNewUsers(type, {
      month,
      year,
    });
  }

  @Get('learner-payments/:type')
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
    @Query('month') month: number,
    @Query('year') year: number,
    @Param('type') type: AnalysisType,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    return this.platformAnalysisService.getLearnerPayment(type, {
      month,
      year,
    });
  }

  @Get('coach-earnings/:type')
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
    @Param('type') type: AnalysisType,
    @Query('month') month: number,
    @Query('year') year: number,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    return this.platformAnalysisService.getCoachSessionEarning(type, {
      month,
      year,
    });
  }

  @Get('revenue/:type')
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
    @Param('type') type: AnalysisType,
    @Query('month') month: number,
    @Query('year') year: number,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    return this.platformAnalysisService.getPlatformRevenue(type, {
      month,
      year,
    });
  }

  @Get('dashboard/overview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Platform Analysis'],
    summary: 'Get dashboard overview data',
    description:
      'Get comprehensive dashboard overview including summary cards and charts data',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard overview data',
    type: DashboardOverviewDto,
  })
  async getDashboardOverview(): Promise<
    CustomApiResponse<DashboardOverviewDto>
  > {
    return this.platformAnalysisService.getDashboardOverview();
  }
}
