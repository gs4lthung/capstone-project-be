import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from '../services/session.service';
import {
  CompleteSessionDto,
  GetSessionForWeeklyCalendarRequestDto,
} from '@app/shared/dtos/sessions/session.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from '@app/shared/enums/user.enum';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Sessions'],
    summary: 'Get session by ID',
    description: 'Retrieve a session by its ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session retrieved successfully',
  })
  @CheckRoles(UserRole.COACH, UserRole.LEARNER)
  @UseGuards(AuthGuard, RoleGuard)
  async getSessionById(@Param('id') id: number) {
    return this.sessionService.findOne(id);
  }

  @Get('calendar/weekly')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Sessions'],
    summary: 'Get weekly calendar sessions',
    description: 'Retrieve weekly calendar sessions for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Weekly calendar sessions retrieved successfully',
  })
  @CheckRoles(UserRole.COACH, UserRole.LEARNER)
  @UseGuards(AuthGuard, RoleGuard)
  async getWeeklyCalendarSessions(
    @Query() data: GetSessionForWeeklyCalendarRequestDto,
  ) {
    console.log('Get weekly calendar sessions called with data:', data);
    return this.sessionService.getSessionsForWeeklyCalendar(data);
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Sessions'],
    summary: 'Complete a session',
    description: 'Complete a session',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session completed successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async completeSession(
    @Param('id') id: number,
    @Body() data: CompleteSessionDto,
  ) {
    return this.sessionService.completeAndCheckAttendance(id, data);
  }
}
