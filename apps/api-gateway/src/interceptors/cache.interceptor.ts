import { RedisService } from '@app/redis';
import { CustomRpcException } from '@app/shared/exceptions/custom-rpc.exception';
import { CustomApiQuery } from '@app/shared/requests/custom-api.request';
import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { from, Observable, switchMap, tap } from 'rxjs';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    const args = ctx.getArgs<CustomApiQuery>();

    const fieldName = info.fieldName as string;
    const isGetAllReq = fieldName[fieldName.length - 1] === 's';
    let cacheKey: string;

    if (isGetAllReq)
      cacheKey = `${fieldName}:page=${args.page || 1}:size=${args.size || 10}:filter=${args.filter || ''}:sort=${args.sort || ''}`;
    else cacheKey = `${fieldName}:${args.id}`;

    return from(this.redisService.get(cacheKey)).pipe(
      switchMap((cachedData) => {
        if (cachedData) {
          if (cachedData === '__NULL__')
            throw new CustomRpcException('NOT_FOUND', HttpStatus.NOT_FOUND);

          return from(Promise.resolve(cachedData));
        }
        return next.handle().pipe(
          tap((data) => {
            this.redisService.set(cacheKey, data);
          }),
        );
      }),
    );
  }
}
