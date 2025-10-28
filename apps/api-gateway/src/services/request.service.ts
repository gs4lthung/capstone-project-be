import { ConfigService } from '@app/config';
import { Course } from '@app/database/entities/course.entity';
import { RequestAction } from '@app/database/entities/request-action.entity';
import { Request } from '@app/database/entities/request.entity';
import { Session } from '@app/database/entities/session.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { Inject, Injectable, Scope, forwardRef } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { PaginatedRequest } from '@app/shared/dtos/requests/request.dto';
import { SessionService } from './session.service';

@Injectable({ scope: Scope.REQUEST })
export class RequestService extends BaseTypeOrmService<Request> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(RequestAction)
    private readonly requestActionRepository: Repository<RequestAction>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => SessionService))
    private readonly sessionService: SessionService,
  ) {
    super(requestRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginatedRequest> {
    return super.find(findOptions, 'request', PaginatedRequest);
  }
}
