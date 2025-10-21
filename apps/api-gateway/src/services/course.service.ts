import { Course } from '@app/database/entities/course.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { PaginatedCourse } from '@app/shared/dtos/course/course.dto';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class CourseService extends BaseTypeOrmService<Course> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {
    super(courseRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginatedCourse> {
    return super.find(findOptions, 'course', PaginatedCourse);
  }
}
