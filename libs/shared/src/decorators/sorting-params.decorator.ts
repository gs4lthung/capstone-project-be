import {
  ArgumentsHost,
  BadRequestException,
  createParamDecorator,
} from '@nestjs/common';
import { Sorting } from '../interfaces/sorting.interface';
import { CustomApiRequest } from '../customs/custom-api-request';
import { ContextUtils } from '../utils/context.util';
import { ProtocolEnum } from '../enums/protocol.enum';

export const SortingParams = createParamDecorator(
  (data, host: ArgumentsHost): Sorting | null => {
    const contextType = ContextUtils.getRequestContextType(host.getType());
    let request: CustomApiRequest;

    let sort: string;

    switch (contextType) {
      case ProtocolEnum.HTTP:
        const ctx = host.switchToHttp();
        request = ctx.getRequest<CustomApiRequest>();
        sort = request.query.sort as string;
        break;
    }

    if (!sort) return;

    // allow nested properties like role.name_asc or coachProfile.fullName_desc
    const sortPattern = /^([a-zA-Z0-9_.]+)_(asc|desc)$/i;
    const match = sort.match(sortPattern);

    if (!match) {
      throw new BadRequestException(`Invalid sort parameter: ${sort}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, property, direction] = match;

    return {
      property,
      direction: direction.toUpperCase() as 'ASC' | 'DESC',
    };
  },
);
