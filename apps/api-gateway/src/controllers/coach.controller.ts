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
} from '@nestjs/swagger';
import { CoachService } from '../services/coach.service';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { User } from '@app/database/entities/user.entity';
import { RegisterCoachDto } from '@app/shared/dtos/coaches/register-coach.dto';
import { Coach } from '@app/database/entities/coach.entity';

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
  async register(
    @CurrentUser('local') user: User,
    @Body() data: RegisterCoachDto,
  ): Promise<Coach> {
    return this.coachService.registerCoach(user.id, data);
  }

  @Put(':id/verify')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify coach profile (admin)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Coach verified' })
  async verify(@Param('id') id: number): Promise<void> {
    return this.coachService.verifyCoach(Number(id));
  }
}
