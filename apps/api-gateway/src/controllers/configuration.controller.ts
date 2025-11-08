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
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';

@Controller('configurations')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Configurations'],
    summary: 'Get all configurations',
    description: 'Retrieve a list of all configurations',
  })
  async findAll(
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ) {
    return this.configurationService.findAll({
      pagination,
      sort,
      filter,
    });
  }

  @Get(':key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Configurations'],
    summary: 'Get a specific configuration by key',
    description: 'Retrieve details of a specific configuration by its key',
  })
  async findOne(@Param('key') key: string) {
    return this.configurationService.findByKey(key);
  }

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
