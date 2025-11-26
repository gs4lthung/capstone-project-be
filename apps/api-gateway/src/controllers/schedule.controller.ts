import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
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
import { SessionNewScheduleDto } from '@app/shared/dtos/schedules/schedule.dto';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('courses/:courseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Schedules'],
    summary: 'Get schedule by course ID',
    description: 'Retrieve the schedule for a specific course by its ID',
  })
  async getScheduleByCourse(
    @Body('courseId') courseId: number,
  ): Promise<Schedule[]> {
    return this.scheduleService.getScheduleByCourse(courseId);
  }

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

  @Put('sessions/:id/new-schedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Schedules'],
    summary: 'Create new schedule for sessions',
    description: 'Create a new schedule for specific sessions',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'New schedule created successfully for sessions',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async createNewScheduleForSessions(
    @Param('id') id: number,
    @Body() data: SessionNewScheduleDto,
  ): Promise<CustomApiResponse<void>> {
    console.log('Creating new schedule for sessions with data:', data);
    return this.scheduleService.changeSessionSchedule(id, data);
  }
}
