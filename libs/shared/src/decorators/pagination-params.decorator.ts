import {
  ArgumentsHost,
  BadRequestException,
  createParamDecorator,
} from '@nestjs/common';
import { CustomApiRequest } from '../customs/custom-api-request';
import { Pagination } from '../interfaces/pagination.interface';
import { ContextUtils } from '../utils/context.util';
import { ProtocolEnum } from '../enums/protocol.enum';

export const PaginationParams = createParamDecorator(
  (data, host: ArgumentsHost): Pagination => {
    const contextType = ContextUtils.getRequestContextType(host.getType());
    let request: CustomApiRequest;

    let page: number, size: number;

    switch (contextType) {
      case ProtocolEnum.HTTP:
        const ctx = host.switchToHttp();
        request = ctx.getRequest<CustomApiRequest>();
        page = parseFloat(String(request.query.page || '1')) || 1;
        size = parseFloat(String(request.query.size || '10')) || 10;
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
