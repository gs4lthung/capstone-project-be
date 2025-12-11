import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StudentAnalysisService } from '../services/student-analysis.service';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalysisResponseDto } from '@app/shared/dtos/coaches/coach.dto';

@Controller('student-analysis')
export class StudentAnalysisController {
  constructor(
    private readonly studentAnalysisService: StudentAnalysisService,
  ) {}

  @Get(':userId/revenue/monthly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Student Analysis'],
    summary: 'Get monthly revenue of the coach',
    description: 'Get monthly revenue of the coach',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Monthly revenue' })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async getMonthlyRevenue(
    @Param('userId') userId: number,
    @Query('month') month: number,
    @Query('year') year: number,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    return this.studentAnalysisService.getMonthlyRevenue(userId, {
      month,
      year,
    });
  }

  @Get(':userId/learners/monthly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Student Analysis'],
    summary: 'Get monthly learner count of the coach',
    description: 'Get monthly learner count of the coach',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Monthly learner count' })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async getMonthlyLearners(
    @Param('userId') userId: number,
    @Query('month') month: number,
    @Query('year') year: number,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    return this.studentAnalysisService.getMonthlyLearnerCount(userId, {
      month,
      year,
    });
  }

  @Get(':userId/courses/monthly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Student Analysis'],
    summary: 'Get monthly course count of the coach',
    description: 'Get monthly course count of the coach',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Monthly course count' })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async getMonthlyCourses(
    @Param('userId') userId: number,
    @Query('month') month: number,
    @Query('year') year: number,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    return this.studentAnalysisService.getMonthlyCourseCount(userId, {
      month,
      year,
    });
  }

  @Get(':userId/sessions/monthly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Student Analysis'],
    summary: 'Get monthly session count of the coach',
    description: 'Get monthly session count of the coach',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Monthly session count' })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async getMonthlySessions(
    @Param('userId') userId: number,
    @Query('month') month: number,
    @Query('year') year: number,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    return this.studentAnalysisService.getMonthlySessionCount(userId, {
      month,
      year,
    });
  }
}
