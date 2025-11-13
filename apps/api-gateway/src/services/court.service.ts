import { Court } from '@app/database/entities/court.entity';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { HttpStatus, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class CourtService extends BaseTypeOrmService<Court> {
  constructor(
    private readonly datasource: DataSource,
    @InjectRepository(Court)
    private readonly courtRepository: Repository<Court>,
  ) {
    super(courtRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginateObject<Court>> {
    return super.find(findOptions, 'court', PaginateObject<Court>);
  }

  async findOne(id: number): Promise<CustomApiResponse<Court>> {
    return new CustomApiResponse<Court>(
      HttpStatus.OK,
      'Court retrieved successfully',
      await this.courtRepository.findOne({
        where: { id: id },
        withDeleted: false,
      }),
    );
  }
}
