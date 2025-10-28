import { Request } from '@app/database/entities/request.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';
import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginatedRequest extends PaginatedResource(Request) {}
