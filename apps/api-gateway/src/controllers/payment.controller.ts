import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from '@app/shared/enums/user.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { Payment } from '@app/database/entities/payment.entity';
import {
  CheckoutResponseDataType,
  CreatePayoutRequestDto,
} from '@app/shared/dtos/payments/payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/courses/:id/link')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Payments'],
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
    return this.paymentService.createCoursePaymentLink(id);
  }

  @Get('courses/success')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Payments'],
    summary: 'Handle payment success callback',
    description: 'Handle payment success callback from PayOS',
  })
  async handlePaymentSuccess(
    @Query('id') id: CheckoutResponseDataType['id'],
    @Query('code') code: CheckoutResponseDataType['code'],
    @Query('orderCode') orderCode: CheckoutResponseDataType['orderCode'],
    @Query('status') status: CheckoutResponseDataType['status'],
    @Query('cancel') cancel: CheckoutResponseDataType['cancel'],
  ): Promise<void> {
    return this.paymentService.handlePaymentSuccess({
      id,
      code,
      orderCode,
      status,
      cancel,
    });
  }

  @Get('courses/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Payments'],
    summary: 'Handle payment success callback',
    description: 'Handle payment success callback from PayOS',
  })
  async handlePaymentCancel(
    @Query('id') id: CheckoutResponseDataType['id'],
    @Query('code') code: CheckoutResponseDataType['code'],
    @Query('orderCode') orderCode: CheckoutResponseDataType['orderCode'],
    @Query('status') status: CheckoutResponseDataType['status'],
    @Query('cancel') cancel: CheckoutResponseDataType['cancel'],
  ): Promise<void> {
    return this.paymentService.handlePaymentCancel({
      id,
      code,
      orderCode,
      status,
      cancel,
    });
  }

  @Post('payouts')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Payments'],
    summary: 'Create a payout request to bank',
    description: 'Create a payout request to bank',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payout request created successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async createPayoutRequest(@Body() data: CreatePayoutRequestDto) {
    return this.paymentService.createPayoutRequest(data);
  }
}
