import { Request } from '@app/database/entities/request.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';

@Injectable({ scope: Scope.REQUEST })
export class RequestService extends BaseTypeOrmService<Request> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
  ) {
    super(requestRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginateObject<Request>> {
    return super.find(findOptions, 'request', PaginateObject<Request>);
  }

  async findOne(id: number): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id: id },
      withDeleted: false,
      relations: ['actions', 'createdBy'],
    });

    if (!request) throw new Error('Request not found');

    return request;
  }
}
