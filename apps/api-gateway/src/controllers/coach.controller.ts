import {
  Body,
  Controller,
  Get,
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
import { RoleGuard } from '../guards/role.guard';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';

@ApiTags('Coaches')
@Controller('coaches')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Coaches'],
    summary: 'Get all coaches',
    description: 'Get all coaches',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coaches',
  })
  async findAll(
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<any> {
    return this.coachService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Coaches'],
    summary: 'Get a coach by id',
    description: 'Get a coach by id',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Coach' })
  async findOne(@Param('id') id: number): Promise<Coach> {
    return this.coachService.findOne(Number(id));
  }

  @Get(':id/rating/overall')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Coaches'],
    summary: 'Get overall rating of the coach',
    description: 'Get overall rating of the coach',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Overall rating' })
  async getOverallRating(
    @Param('id') id: number,
  ): Promise<CustomApiResponse<number>> {
    return this.coachService.getOverallRating(id);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register as a coach (creates user account + coach profile)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Coach profile created',
  })
  async register(
    @Body() data: RegisterCoachDto,
  ): Promise<CustomApiResponse<void>> {
    return this.coachService.registerCoach(data);
  }

  @Put(':id/verify')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify coach profile (admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xác minh hồ sơ huấn luyện viên thành công',
  })
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
  async verify(@Param('id') id: number): Promise<{ message: string }> {
    await this.coachService.verifyCoach(Number(id));
    return { message: 'Xác minh hồ sơ huấn luyện viên thành công' };
  }

  @Put(':id/reject')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject coach profile (admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Từ chối hồ sơ huấn luyện viên thành công',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async reject(
    @Param('id') id: number,
    @Body() body: RejectCoachDto,
  ): Promise<{ message: string }> {
    await this.coachService.rejectCoach(Number(id), body?.reason);
    return { message: 'Từ chối hồ sơ huấn luyện viên thành công' };
  }
}
