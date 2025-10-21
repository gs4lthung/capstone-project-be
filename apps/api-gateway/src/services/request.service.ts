import { ConfigService } from '@app/config';
import { Course } from '@app/database/entities/course.entity';
import { RequestAction } from '@app/database/entities/request-action.entity';
import { Request } from '@app/database/entities/request.entity';
import { Session } from '@app/database/entities/session.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CreateCourseRequestDto } from '@app/shared/dtos/course/course.dto';
import {
  RequestActionType,
  RequestStatus,
  RequestType,
} from '@app/shared/enums/request.enum';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
  forwardRef,
} from '@nestjs/common';
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

  async createCourseCreationRequest(
    data: CreateCourseRequestDto,
  ): Promise<CustomApiResponse<void>> {
    const newCourseCreationRequest = this.requestRepository.create({
      description: 'Tạo khóa học',
      type: RequestType.COURSE_APPROVAL,
      metadata: data,
      createdBy: this.request.user as User,
      status: RequestStatus.PENDING,
    });

    await this.requestRepository.save(newCourseCreationRequest);

    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'COURSE.CREATE_SUCCESS',
    );
  }

  async approveCourseCreationRequest(
    id: number,
  ): Promise<CustomApiResponse<void>> {
    const request = await this.requestRepository.findOne({
      where: { id: id },
      relations: ['createdBy', 'actions'],
    });
    if (!request) throw new BadRequestException('Không tìm thấy yêu cầu');
    if (request.status !== RequestStatus.PENDING)
      throw new BadRequestException('Yêu cầu không được chờ duyệt');

    const newCourse = this.courseRepository.create({
      ...request.metadata,
      createdBy: request.createdBy,
    } as Course);
    await this.courseRepository.save(newCourse);

    if (request.metadata.schedules && request.metadata.schedules.length > 0) {
      const sessions = this.sessionService.generateSessionsFromSchedules(
        newCourse,
        request.metadata.schedules,
      );
      await this.sessionRepository.insert(sessions);
    }

    request.status = RequestStatus.APPROVED;
    await this.requestRepository.save(request);

    const newRequestAction = this.requestActionRepository.create({
      type: RequestActionType.APPROVED,
      comment: 'Yêu cầu đã được duyệt',
      request: request,
      handledBy: this.request.user as User,
    });
    await this.requestActionRepository.save(newRequestAction);

    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'COURSE.CREATE_SUCCESS',
    );
  }
}
