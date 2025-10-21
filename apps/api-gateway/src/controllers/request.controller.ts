import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateCourseRequestDto } from '@app/shared/dtos/course/course.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoleGuard } from '../guards/role.guard';
import { UserRole } from '@app/shared/enums/user.enum';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { RequestService } from '../services/request.service';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';

@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post('/courses')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Requests'],
    summary: 'Create a new course creation request',
    description: 'Create a new course creation request with given data',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Course created successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async createCourse(@Body() data: CreateCourseRequestDto) {
    return this.requestService.createCourseCreationRequest(data);
  }

  @Patch('/courses/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Requests'],
    summary: 'Approve a course creation request',
    description: 'Approve a course creation request with given ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course creation request approved successfully',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async approveCourseCreationRequest(
    @Param('id') id: number,
  ): Promise<CustomApiResponse<void>> {
    return this.requestService.approveCourseCreationRequest(id);
  }
}