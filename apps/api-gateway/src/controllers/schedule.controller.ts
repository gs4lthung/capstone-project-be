import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from '../services/schedule.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Schedule } from '@app/database/entities/schedule.entity';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('coaches/available')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Schedules'],
    summary: 'Get available schedules for the coach',
    description:
      'Retrieve a list of available schedules for the authenticated coach',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available schedules retrieved successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async getAvailableSchedulesByCoach(): Promise<CustomApiResponse<Schedule[]>> {
    return this.scheduleService.getAvailableSchedulesByCoach();
  }
}
