import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from '../services/attendance.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Attendance } from '@app/database/entities/attendance.entity';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { AuthGuard } from '../guards/auth.guard';

@Controller('attendances')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('sessions/:sessionId/learners/:learnerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Attendances'],
    summary: 'Get learner attendance for a session',
    description:
      'Retrieve attendance information for the learner in a specific session',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Learner attendance retrieved successfully',
  })
  @UseGuards(AuthGuard)
  async coachGetLearnerAttendance(
    @Param('sessionId') sessionId: number,
    @Param('learnerId') learnerId: number,
  ): Promise<CustomApiResponse<Attendance>> {
    return await this.attendanceService.getLearnerAttendance(
      sessionId,
      learnerId,
    );
  }
}
