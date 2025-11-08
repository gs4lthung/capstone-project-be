import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { StudentAnalysisService } from '../services/student-analysis.service';
import {
  CoachMonthlyCourseRequestDto,
  CoachMonthlyCourseResponseDto,
  CoachMonthlyLearnerRequestDto,
  CoachMonthlyLearnerResponseDto,
  CoachMonthlyRevenueRequestDto,
  CoachMonthlyRevenueResponseDto,
  CoachMonthlySessionRequestDto,
  CoachMonthlySessionResponseDto,
} from '@app/shared/dtos/coaches/coach.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('student-analysis')
export class StudentAnalysisController {
  constructor(
    private readonly studentAnalysisService: StudentAnalysisService,
  ) {}

  @Get(':id/revenue/monthly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Coaches'],
    summary: 'Get monthly revenue of the coach',
    description: 'Get monthly revenue of the coach',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Monthly revenue' })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async getMonthlyRevenue(
    @Param('id') id: number,
    @Body() data: CoachMonthlyRevenueRequestDto,
  ): Promise<CustomApiResponse<CoachMonthlyRevenueResponseDto>> {
    return this.studentAnalysisService.getMonthlyRevenue(id, data);
  }

  @Get(':id/learners/monthly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Coaches'],
    summary: 'Get monthly learner count of the coach',
    description: 'Get monthly learner count of the coach',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Monthly learner count' })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async getMonthlyLearners(
    @Param('id') id: number,
    @Body() data: CoachMonthlyLearnerRequestDto,
  ): Promise<CustomApiResponse<CoachMonthlyLearnerResponseDto>> {
    return this.studentAnalysisService.getMonthlyLearnerCount(id, data);
  }

  @Get(':id/courses/monthly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Coaches'],
    summary: 'Get monthly course count of the coach',
    description: 'Get monthly course count of the coach',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Monthly course count' })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async getMonthlyCourses(
    @Param('id') id: number,
    @Body() data: CoachMonthlyCourseRequestDto,
  ): Promise<CustomApiResponse<CoachMonthlyCourseResponseDto>> {
    return this.studentAnalysisService.getMonthlyCourseCount(id, data);
  }

  @Get(':id/sessions/monthly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Coaches'],
    summary: 'Get monthly session count of the coach',
    description: 'Get monthly session count of the coach',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Monthly session count' })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async getMonthlySessions(
    @Param('id') id: number,
    @Body() data: CoachMonthlySessionRequestDto,
  ): Promise<CustomApiResponse<CoachMonthlySessionResponseDto>> {
    return this.studentAnalysisService.getMonthlySessionCount(id, data);
  }
}
