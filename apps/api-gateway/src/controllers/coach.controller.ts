import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CoachService } from '../services/coach.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreateCoachPackageDto,
  CreateCoachProfileCredentialDto,
  CreateCoachProfileDto,
  UpdateCoachProfileCredentialDto,
  UpdateCoachProfileDto,
  VerifyCoachProfileDto,
} from '@app/shared/dtos/users/coaches/coach.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { RoleGuard } from '../guards/role.guard';
import { UserRole } from '@app/shared/enums/user.enum';
import { AuthGuard } from '../guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeLimitEnum } from '@app/shared/enums/file.enum';

@Controller('coaches')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}
  @Post('profiles')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Coaches'],
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

  @Put('profiles')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Coaches'],
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

  @Put('profiles/verify')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Coaches'],
    summary: 'Verify Coach Profile',
    description: 'Verify a coach profile by admin',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coach profile verified successfully',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async verifyCoachProfile(
    @Body() data: VerifyCoachProfileDto,
  ): Promise<CustomApiResponse<void>> {
    return this.coachService.verifyCoachProfile(data);
  }

  @Post('profiles/credentials')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Coaches'],
    summary: 'Create Coach Profile Credential',
    description: 'Create a credential for the authenticated coach user',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Coach profile credential created successfully',
  })
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('credential_image', {
      limits: {
        fileSize: FileSizeLimitEnum.IMAGE,
      },
    }),
  )
  async createCoachProfileCredential(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: CreateCoachProfileCredentialDto,
  ): Promise<CustomApiResponse<void>> {
    return this.coachService.createCoachProfileCredential(file, data);
  }

  @Put('profiles/credentials')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Coaches'],
    summary: 'Update Coach Profile Credential',
    description: 'Update a credential for the authenticated coach user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coach profile credential updated successfully',
  })
  @UseGuards(AuthGuard)
  async updateCoachProfileCredential(
    @Body() data: UpdateCoachProfileCredentialDto,
  ): Promise<CustomApiResponse<void>> {
    return this.coachService.updateCoachProfileCredential(data);
  }

  @Post('packages')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Coaches'],
    summary: 'Create Coach Package',
    description: 'Create a coach package for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Coach package created successfully',
  })
  @UseGuards(AuthGuard)
  async createCoachPackage(
    @Body() data: CreateCoachPackageDto,
  ): Promise<CustomApiResponse<void>> {
    return this.coachService.createCoachPackage(data);
  }
}
