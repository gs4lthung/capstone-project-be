import {
  ArgumentsHost,
  BadRequestException,
  createParamDecorator,
  InternalServerErrorException,
} from '@nestjs/common';
import { Sorting } from '../interfaces/sorting.interface';
import { CustomApiRequest } from '../interfaces/requests/custom-api.request';
import { ContextUtils } from '../utils/context.util';
import { ProtocolEnum } from '../enums/protocol.enum';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { DtoUtils } from '../utils/dto.util';

export const SortingParams = createParamDecorator(
  (data, host: ArgumentsHost): Sorting => {
    const contextType = ContextUtils.getRequestContextType(host.getType());
    let request: CustomApiRequest;

    let sort: string;

    switch (contextType) {
      case ProtocolEnum.HTTP:
        const ctx = host.switchToHttp();
        request = ctx.getRequest<CustomApiRequest>();
        sort = request.query.sort;
        break;
      case ProtocolEnum.GRAPHQL:
        const gqlCtx = GqlArgumentsHost.create(host);
        request = gqlCtx.getContext().req;
        sort = DtoUtils.getGqlArgs(request.body.query, 'sort');
        break;
    }

    if (!sort) return null;

    if (typeof data != 'object')
      throw new InternalServerErrorException('Invalid sort params');

    const sortPattern = /^([a-zA-Z0-9]+):(asc|desc)$/;
    if (!sort.match(sortPattern))
      throw new BadRequestException('Invalid sort params');

    const [property, direction] = sort.split(':');
    if (!data.includes(property)) {
      throw new BadRequestException('Invalid sort property');
    }

    return { property, direction: direction.toUpperCase() as 'ASC' | 'DESC' };
  },
);
