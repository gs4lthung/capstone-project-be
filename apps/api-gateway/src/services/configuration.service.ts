import { Configuration } from '@app/database/entities/configuration.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  CreateConfigurationDto,
  UpdateConfigurationDto,
} from '@app/shared/dtos/configurations/configuration.dto';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class ConfigurationService extends BaseTypeOrmService<Configuration> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Configuration)
    private readonly configurationRepository: Repository<Configuration>,
    private readonly datasource: DataSource,
  ) {
    super(configurationRepository);
  }

  async findAll(
    findOptions: FindOptions,
  ): Promise<PaginateObject<Configuration>> {
    return super.find(
      findOptions,
      'configuration',
      PaginateObject<Configuration>,
    );
  }

  async findByKey(key: string): Promise<CustomApiResponse<Configuration>> {
    return await this.datasource.transaction(async (manager) => {
      return new CustomApiResponse<Configuration>(
        HttpStatus.OK,
        'Configuration retrieved successfully',
        await manager.getRepository(Configuration).findOne({
          where: { key },
        }),
      );
    });
  }

  async create(data: CreateConfigurationDto): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const newConfiguration = this.configurationRepository.create({
        ...data,
        createdBy: { id: this.request.user.id as User['id'] },
        updatedBy: { id: this.request.user.id as User['id'] },
      });
      await manager.getRepository(Configuration).save(newConfiguration);
      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'Configuration created successfully',
      );
    });
  }

  async update(
    id: number,
    data: UpdateConfigurationDto,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const configuration = await manager.getRepository(Configuration).findOne({
        where: { id },
      });
      if (!configuration) {
        return new CustomApiResponse<void>(
          HttpStatus.NOT_FOUND,
          'Configuration not found',
        );
      }
      await manager.getRepository(Configuration).update(id, {
        ...data,
        updatedBy: { id: this.request.user.id as User['id'] },
      });
      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Configuration updated successfully',
      );
    });
  }
}
