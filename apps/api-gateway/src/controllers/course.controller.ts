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
import { CourseService } from '../services/course.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CreateCourseRequestDto } from '@app/shared/dtos/course/course.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { Payment } from '@app/database/entities/payment.entity';
import { WebhookType } from '@payos/node/lib/type';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}
  @Post()
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
    return this.courseService.createCourseCreationRequest(data);
  }

  @Patch('requests/:id/approve')
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
    return this.courseService.approveCourseCreationRequest(id);
  }

  @Patch(':id/enroll')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Courses'],
    summary: 'Enroll a course',
    description: 'Enroll a course with given ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course enrolled successfully',
  })
  @CheckRoles(UserRole.LEARNER)
  @UseGuards(AuthGuard, RoleGuard)
  async enrollCourse(
    @Param('id') id: number,
  ): Promise<CustomApiResponse<void>> {
    return this.courseService.enrollCourse(id);
  }

  @Patch(':id/payment-link')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Courses'],
    summary: 'Create a payment link for a course',
    description: 'Create a payment link for a course',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Course payment link created successfully',
  })
  @CheckRoles(UserRole.LEARNER)
  @UseGuards(AuthGuard, RoleGuard)
  async createCoursePaymentLink(
    @Param('id') id: number,
  ): Promise<CustomApiResponse<Payment>> {
    return this.courseService.createCoursePaymentLink(id);
  }

  @Post('receive-payment-webhook')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Payments'],
    summary: 'Receive a payment webhook',
    description: 'Receive a payment webhook',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment webhook received successfully',
  })
  async receivePaymentWebhook(@Body('payment') payment: WebhookType) {
    return true;
  }
}
