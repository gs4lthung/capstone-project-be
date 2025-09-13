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
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoleEnum } from '@app/shared/enums/role.enum';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { CreateUserDto } from '@app/shared/dtos/users/create-user.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeLimitEnum } from '@app/shared/enums/file.enum';
import { UserService } from '../services/user.service';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Users'],
    summary: 'Get All Users',
    description: 'Retrieve a list of all users',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @CheckRoles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('per_page') per_page: number = 10,
  ): Promise<
    CustomApiResponse<{
      data: {
        id: number;
        fullName: string;
        email: string;
        profilePicture?: string;
        createdAt: Date;
        updatedAt: Date;
        coachProfile?: any;
      }[];
      current_page: number;
      last_page: number;
      total: number;
      per_page: number;
    }>
  > {
    const result = await this.userService.findAll({
      pagination: {
        page,
        size: per_page,
        offset: (page - 1) * per_page,
      },
    });
    return new CustomApiResponse(
      HttpStatus.OK,
      'Users retrieved successfully',
      {
        data: result.items,
        current_page: result.page,
        last_page: Math.ceil(result.total / result.pageSize),
        total: result.total,
        per_page: result.pageSize,
      },
    );
  }

  @Post('')
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
  @CheckRoles(RoleEnum.ADMIN)
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
  @CheckRoles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async softDeleteUser(
    @Param('id') id: number,
  ): Promise<CustomApiResponse<void>> {
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
  @CheckRoles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async deleteUser(@Param('id') id: number): Promise<CustomApiResponse<void>> {
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
  @CheckRoles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async restoreUser(@Param('id') id: number): Promise<CustomApiResponse<void>> {
    return this.userService.restore(id);
  }
}
