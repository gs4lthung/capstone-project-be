import { ConfigService } from '@app/config';
import { RedisService } from '@app/redis';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { CustomApiQuery } from '@app/shared/customs/custom-api-request';
import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { from, Observable, switchMap, tap } from 'rxjs';
import { GraphQLResolveInfo } from 'graphql';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const info: GraphQLResolveInfo = ctx.getInfo();
    const args = ctx.getArgs<CustomApiQuery>();

    const fieldName = info.fieldName as string;

    const query = request.body.query
      .replace(/\{/g, ':{')
      .trim()
      .split(' ') as string[];

    const argIdIndex = query.findIndex((q) => q.includes('id:'));
    const argId = query[argIdIndex + 1].split(')')[0];

    const isGetAllReq = fieldName[fieldName.length - 1] === 's';
    let cacheKey =
      fieldName.split('_').length === 1
        ? fieldName
        : `${fieldName.split('_')[0]}:${argId}:${fieldName.split('_')[1]}`;

    if (isGetAllReq)
      cacheKey = `${cacheKey}:page=${args.page || 1},size=${args.size || 10},filter=${args.filter || ''},sort=${args.sort || ''}`;
    else cacheKey = `${cacheKey}:${argId}:`;

    return from(this.redisService.get(cacheKey)).pipe(
      switchMap((cachedData) => {
        if (cachedData) {
          switch (cachedData) {
            case '__NULL__':
              throw new CustomRpcException('NOT_FOUND', HttpStatus.NOT_FOUND);
            default:
              break;
          }

          return from(Promise.resolve(cachedData));
        }

        return next.handle().pipe(
          tap((data) => {
            this.redisService.set(
              cacheKey,
              data,
              this.configService.get('cache').ttl,
            );
          }),
        );
      }),
    );
  }
}
