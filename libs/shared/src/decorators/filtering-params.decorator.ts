import {
  ArgumentsHost,
  BadRequestException,
  createParamDecorator,
} from '@nestjs/common';
import { FilterRule } from '../enums/filter-rules.enum';
import { CustomApiRequest } from '../customs/custom-api-request';
import { ProtocolEnum } from '../enums/protocol.enum';
import { Filtering } from '../interfaces/filtering.interface';
import { ContextUtils } from '../utils/context.util';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { DtoUtils } from '../utils/dto.util';

export const FilteringParams = createParamDecorator(
  (data, host: ArgumentsHost): Filtering[] => {
    const contextType = ContextUtils.getRequestContextType(host.getType());
    let request: CustomApiRequest;

    let filter: string;

    switch (contextType) {
      case ProtocolEnum.HTTP:
        const ctx = host.switchToHttp();
        request = ctx.getRequest<CustomApiRequest>();
        filter = request.query.filter as string;
        break;
      case ProtocolEnum.GRAPHQL:
        const gqlCtx = GqlArgumentsHost.create(host);
        request = gqlCtx.getContext().req;
        filter = DtoUtils.getGqlArgs(request.body.query, 'filter');
        break;
    }

    if (!filter) return;

    const filterStrings = filter.split(',');

    return filterStrings.map((f) => {
      if (
        !f.match(
          /^[a-zA-Z0-9.]+_(eq|neq|gt|gte|lt|lte|like|nlike|in|nin)_.+$/,
        ) &&
        !f.match(/^[a-zA-Z0-9.]+_(isnull|isnotnull)$/)
      ) {
        throw new BadRequestException(`Invalid filter parameter: ${filter}`);
      }

      const [property, rule, value] = f.split('_');

      if (!Object.values(FilterRule).includes(rule as FilterRule))
        throw new BadRequestException(`Invalid filter rule: ${rule}`);

      let parsedValue: string = value;
      if (rule === 'in' || rule === 'nin') {
        parsedValue = value ? value : '';
      }

      return { property, rule, value: parsedValue };
    });
  },
);
