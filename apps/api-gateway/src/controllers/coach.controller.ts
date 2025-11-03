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
import { RegisterCoachDto } from '@app/shared/dtos/coaches/register-coach.dto';
import { Coach } from '@app/database/entities/coach.entity';
import { RejectCoachDto } from '@app/shared/dtos/coaches/reject-coach.dto';
import { UserRole } from '@app/shared/enums/user.enum';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';

@ApiTags('Coaches')
@Controller('coaches')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register as a coach (creates user account + coach profile)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Coach profile created',
  })
  async register(@Body() data: RegisterCoachDto): Promise<Coach> {
    return this.coachService.registerCoach(data);
  }

  @Put(':id/verify')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify coach profile (admin)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Coach verified' })
  @CheckRoles(UserRole.ADMIN)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        approvedSubjectIds: { type: 'array', items: { type: 'number' } },
      },
      required: ['approvedSubjectIds'],
    },
  })
  async verify(@Param('id') id: number): Promise<void> {
    return this.coachService.verifyCoach(Number(id));
  }

  @Put(':id/reject')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject coach profile (admin)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Coach rejected' })
  @CheckRoles(UserRole.ADMIN)
  async reject(
    @Param('id') id: number,
    @Body() body: RejectCoachDto,
  ): Promise<void> {
    return this.coachService.rejectCoach(Number(id), body?.reason);
  }
}
