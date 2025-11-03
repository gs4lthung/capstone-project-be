import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from '@app/shared/enums/user.enum';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeLimitEnum } from '@app/shared/enums/file.enum';
import { UserService } from '../services/user.service';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CreateUserDto } from '@app/shared/dtos/users/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
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
  @CheckRoles(UserRole.ADMIN)
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
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async restoreUser(@Param('id') id: number): Promise<CustomApiResponse<void>> {
    return this.userService.restore(id);
  }
}
