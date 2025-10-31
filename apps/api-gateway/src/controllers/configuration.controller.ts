import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ConfigurationService } from '../services/configuration.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  CreateConfigurationDto,
  UpdateConfigurationDto,
} from '@app/shared/dtos/configurations/configuration.dto';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@Controller('configurations')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Configurations'],
    summary: 'Create a new configuration',
    description: 'Create a new configuration with given data',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async createConfiguration(@Body() data: CreateConfigurationDto) {
    return this.configurationService.createConfiguration(data);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Configurations'],
    summary: 'Update an existing configuration',
    description: 'Update an existing configuration with given data',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async updateConfiguration(
    @Param('id') id: number,
    @Body() data: UpdateConfigurationDto,
  ) {
    return this.configurationService.updateConfiguration(id, data);
  }
}
