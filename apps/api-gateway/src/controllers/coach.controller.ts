import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CoachService } from '../services/coach.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreateCoachProfileDto,
  UpdateCoachProfileDto,
  VerifyCoachProfileDto,
} from '@app/shared/dtos/users/coaches/coach.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { RoleGuard } from '../guards/role.guard';
import { RoleEnum } from '@app/shared/enums/role.enum';
import { AuthGuard } from '../guards/auth.guard';

@Controller('coaches')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}
  @Post('profile/me')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Users'],
    summary: 'Create Coach Profile',
    description: 'Create a coach profile for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Coach profile created successfully',
  })
  @UseGuards(AuthGuard)
  async createCoachProfile(
    @Body() data: CreateCoachProfileDto,
  ): Promise<CustomApiResponse<void>> {
    return this.coachService.createCoachProfile(data);
  }

  @Put('profile/me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Users'],
    summary: 'Update Coach Profile',
    description: 'Update the coach profile of the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coach profile updated successfully',
  })
  @UseGuards(AuthGuard)
  async updateCoachProfile(
    @Body() data: UpdateCoachProfileDto,
  ): Promise<CustomApiResponse<void>> {
    return this.coachService.updateCoachProfile(data);
  }

  @Put('profile/verify')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Users'],
    summary: 'Verify Coach Profile',
    description: 'Verify a coach profile by admin',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coach profile verified successfully',
  })
  @CheckRoles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async verifyCoachProfile(
    @Body() data: VerifyCoachProfileDto,
  ): Promise<CustomApiResponse<void>> {
    return this.coachService.verifyCoachProfile(data);
  }
}
