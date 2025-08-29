import {
  ArgumentsHost,
  BadRequestException,
  createParamDecorator,
  InternalServerErrorException,
} from '@nestjs/common';
import { Filtering } from '../interfaces/filtering.interface';
import { CustomApiRequest } from '../interfaces/requests/custom-api.request';
import { FilterRule } from '../enums/filter-rules.enum';
import { ContextUtils } from '../utils/context.util';
import { ProtocolEnum } from '../enums/protocol.enum';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { DtoUtils } from '../utils/dto.util';

export const FilteringParams = createParamDecorator(
  (data, host: ArgumentsHost): Filtering => {
    const contextType = ContextUtils.getRequestContextType(host.getType());
    let request: CustomApiRequest;

    let filter: string;

    switch (contextType) {
      case ProtocolEnum.HTTP:
        const ctx = host.switchToHttp();
        request = ctx.getRequest<CustomApiRequest>();
        filter = request.query.filter;
        break;
      case ProtocolEnum.GRAPHQL:
        const gqlCtx = GqlArgumentsHost.create(host);
        request = gqlCtx.getContext().req;
        filter = DtoUtils.getGqlArgs(request.body.query, 'filter');
        break;
    }

    if (!filter) return null;

    if (typeof data != 'object')
      throw new InternalServerErrorException('Invalid filter parameter');

    if (
      !filter.match(
        /^[a-zA-Z0-9_]+:(eq|neq|gt|gte|lt|lte|like|nlike|in|nin):[a-zA-Z0-9_,]+$/,
      ) &&
      !filter.match(/^[a-zA-Z0-9_]+:(isnull|isnotnull)$/)
    ) {
      throw new BadRequestException('Invalid filter parameter');
    }

    const [property, rule, value] = filter.split(':');
    if (!data.includes(property))
      throw new BadRequestException(`Invalid filter property: ${property}`);
    if (!Object.values(FilterRule).includes(rule as FilterRule))
      throw new BadRequestException(`Invalid filter rule: ${rule}`);

    return { property, rule, value };
  },
);
