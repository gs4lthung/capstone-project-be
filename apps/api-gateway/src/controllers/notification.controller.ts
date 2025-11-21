import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { AuthGuard } from '../guards/auth.guard';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all notifications for the authenticated user',
  })
  @UseGuards(AuthGuard)
  async getAllNotifications(
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ) {
    return this.notificationService.findAll({
      pagination,
      sort,
      filter,
    });
  }

  @Get('unread')
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get unread notifications for the authenticated user',
  })
  @UseGuards(AuthGuard)
  async getUnreadNotifications(@Req() req: CustomApiRequest) {
    return this.notificationService.getUserUnreadNotifications(
      req.user.id as number,
    );
  }

  @Put(':id/read')
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mark a notification as read',
  })
  @UseGuards(AuthGuard)
  async markAsRead(@Param('id') id: number) {
    await this.notificationService.markNotificationAsRead(id);
  }

  @Put('read')
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mark all notifications as read',
  })
  @UseGuards(AuthGuard)
  async markAllAsRead(@Req() req: CustomApiRequest) {
    await this.notificationService.markAllNotificationsAsRead(
      req.user.id as number,
    );
  }
}
