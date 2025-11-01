import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from '../services/session.service';
import { CompleteSessionDto } from '@app/shared/dtos/sessions/session.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from '@app/shared/enums/user.enum';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

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
