import { Enrollment } from '@app/database/entities/enrollment.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class EnrollmentService extends BaseTypeOrmService<Enrollment> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {
    super(enrollmentRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginateObject<Enrollment>> {
    return super.find(findOptions, 'enrollment', PaginateObject<Enrollment>);
  }

  async findOne(id: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: id },
      withDeleted: false,
      relations: ['user', 'course', 'payments'],
    });

    if (!enrollment) throw new Error('Enrollment not found');

    return enrollment;
  }
}
