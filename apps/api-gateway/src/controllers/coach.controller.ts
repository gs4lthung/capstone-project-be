import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { CoachService } from '../services/coach.service';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { User } from '@app/database/entities/user.entity';
import { RegisterCoachDto } from '@app/shared/dtos/coaches/register-coach.dto';
import { Coach } from '@app/database/entities/coach.entity';
import { RejectCoachDto } from '@app/shared/dtos/coaches/reject-coach.dto';
import { UserRole } from '@app/shared/enums/user.enum';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { RoleGuard } from '../guards/role.guard';

@ApiTags('Coaches')
@Controller('coaches')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Post('register')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register as a coach' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Coach profile created',
  })
  @CheckRoles(UserRole.LEARNER)
  async register(
    @CurrentUser('local') user: User,
    @Body() data: RegisterCoachDto,
  ): Promise<Coach> {
    return this.coachService.registerCoach(user.id, data);
  }

  @Put(':id/verify')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify coach profile (admin)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Coach verified' })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        approvedSubjectIds: { type: 'array', items: { type: 'number' } },
      },
      required: ['approvedSubjectIds'],
    },
  })
  async verify(
    @Param('id') id: number,
    @Body('approvedSubjectIds') approvedSubjectIds: number[],
  ): Promise<void> {
    return this.coachService.verifyCoach(Number(id), approvedSubjectIds);
  }

  @Put(':id/reject')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject coach profile (admin)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Coach rejected' })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async reject(
    @Param('id') id: number,
    @Body() body: RejectCoachDto,
  ): Promise<void> {
    return this.coachService.rejectCoach(Number(id), body?.reason);
  }
}
