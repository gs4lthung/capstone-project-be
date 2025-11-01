import { Configuration } from '@app/database/entities/configuration.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  CreateConfigurationDto,
  UpdateConfigurationDto,
} from '@app/shared/dtos/configurations/configuration.dto';
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class ConfigurationService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Configuration)
    private readonly configurationRepository: Repository<Configuration>,
  ) {}

  async findByKey(key: string): Promise<Configuration | null> {
    return this.configurationRepository.findOne({
      where: { key },
    });
  }

  async createConfiguration(
    data: CreateConfigurationDto,
  ): Promise<CustomApiResponse<void>> {
    const newConfiguration = this.configurationRepository.create({
      ...data,
      createdBy: { id: this.request.user.id as User['id'] },
      updatedBy: { id: this.request.user.id as User['id'] },
    });
    await this.configurationRepository.save(newConfiguration);
    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'Configuration created successfully',
    );
  }

  async updateConfiguration(
    id: number,
    data: UpdateConfigurationDto,
  ): Promise<CustomApiResponse<void>> {
    const configuration = await this.configurationRepository.findOne({
      where: { id },
    });
    if (!configuration) {
      return new CustomApiResponse<void>(
        HttpStatus.NOT_FOUND,
        'Configuration not found',
      );
    }
    await this.configurationRepository.update(id, {
      ...data,
      updatedBy: { id: this.request.user.id as User['id'] },
    });
    return new CustomApiResponse<void>(
      HttpStatus.OK,
      'Configuration updated successfully',
    );
  }
}
