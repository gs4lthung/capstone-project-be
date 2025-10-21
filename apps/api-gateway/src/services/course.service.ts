import { ConfigService } from '@app/config';
import { Course } from '@app/database/entities/course.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
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
    private readonly configService: ConfigService,
  ) {
    super(courseRepository);
  }
}
