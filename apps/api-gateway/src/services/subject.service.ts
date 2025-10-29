import { Subject } from '@app/database/entities/subject.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
} from '@app/shared/dtos/subjects/subject.dto';
import { SubjectStatus } from '@app/shared/enums/subject.enum';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class SubjectService extends BaseTypeOrmService<Subject> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {
    super(subjectRepository);
  }

  async create(data: CreateSubjectDto): Promise<CustomApiResponse<void>> {
    const newSubject = this.subjectRepository.create({
      ...data,
      createdBy: this.request.user as User,
      status: SubjectStatus.DRAFT,
    } as Subject);

    await this.subjectRepository.save(newSubject);

    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'SUBJECT.CREATE_SUCCESS',
    );
  }

  async update(
    id: number,
    data: UpdateSubjectDto,
  ): Promise<CustomApiResponse<void>> {
    const subject = await this.subjectRepository.findOne({
      where: { id: id },
      withDeleted: false,
      relations: ['createdBy'],
    });
    if (!subject) throw new BadRequestException('Không tìm thấy khóa học');

    await this.subjectRepository.update(subject.id, data);

    return new CustomApiResponse<void>(HttpStatus.OK, 'SUBJECT.UPDATE_SUCCESS');
  }
}
