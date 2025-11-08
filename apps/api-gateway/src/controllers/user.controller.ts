import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { UserRole } from '@app/shared/enums/user.enum';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeLimitEnum } from '@app/shared/enums/file.enum';
import { UserService } from '../services/user.service';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CreateUserDto } from '@app/shared/dtos/users/create-user.dto';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { User } from '@app/database/entities/user.entity';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Users'],
    summary: 'Get all users',
    description: 'Retrieve a list of all users',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users retrieved successfully',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'size',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    type: String,
    description:
      'Filter by field: {field}_{rule}_{value}. Rules: eq, neq, gt, gte, lt, lte, like, nlike, in, nin, isnull, isnotnull. Multiple filters separated by comma. Example: email_like_@gmail.com,isEmailVerified_eq_true',
    example: 'email_like_@gmail.com',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async finAll(
    @PaginationParams()
    pagination: Pagination,
    @FilteringParams() filter: Filtering,
  ): Promise<PaginateObject<User>> {
    return this.userService.findAll({
      pagination,
      filter,
    } as FindOptions);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    tags: ['Users'],
    summary: 'Create User',
    description: 'Create a new user',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async createUser(
    @Body() data: CreateUserDto,
  ): Promise<CustomApiResponse<void>> {
    return this.userService.create(data);
  }

  @Put('me/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Users'],
    summary: 'Update User Avatar',
    description: 'Update the avatar image of a user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User avatar updated successfully',
  })
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: FileSizeLimitEnum.IMAGE,
      },
    }),
  )
  async updateMyAvatar(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    return this.userService.updateMyAvatar(file);
  }

  @Delete(':id/soft')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Users'],
    summary: 'Delete User',
    description: 'Delete a user by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async softDelete(@Param('id') id: number): Promise<CustomApiResponse<void>> {
    return this.userService.softDelete(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Users'],
    summary: 'Delete User',
    description: 'Delete a user by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async delete(@Param('id') id: number): Promise<CustomApiResponse<void>> {
    return this.userService.delete(id);
  }

  @Delete(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Users'],
    summary: 'Restore User',
    description: 'Restore a soft-deleted user by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User restored successfully',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async restore(@Param('id') id: number): Promise<CustomApiResponse<void>> {
    return this.userService.restore(id);
  }
}
