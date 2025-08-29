import {
  ArgumentsHost,
  BadRequestException,
  createParamDecorator,
} from '@nestjs/common';
import { CustomApiRequest } from '../interfaces/requests/custom-api.request';
import { Pagination } from '../interfaces/pagination.interface';
import { ContextUtils } from '../utils/context.util';
import { ProtocolEnum } from '../enums/protocol.enum';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { DtoUtils } from '../utils/dto.util';

export const PaginationParams = createParamDecorator(
  (data, host: ArgumentsHost): Pagination => {
    const contextType = ContextUtils.getRequestContextType(host.getType());
    let request: CustomApiRequest;

    let page: number, size: number;

    switch (contextType) {
      case ProtocolEnum.HTTP:
        const ctx = host.switchToHttp();
        request = ctx.getRequest<CustomApiRequest>();
        page = request.query.page;
        size = request.query.size;
        break;
      case ProtocolEnum.GRAPHQL:
        const gqlCtx = GqlArgumentsHost.create(host);
        request = gqlCtx.getContext().req;
        page = parseFloat(DtoUtils.getGqlArgs(request.body.query, 'page'));
        size = parseFloat(DtoUtils.getGqlArgs(request.body.query, 'size'));
        break;
    }
    if (page < 1 || size < 1)
      throw new BadRequestException('Invalid pagination params');

    if (size > 100) {
      throw new BadRequestException(
        'Invalid pagination params: size must be less than or equal to 100',
      );
    }

    const offset = (page - 1) * size;
    return { page, size, offset };
  },
);
