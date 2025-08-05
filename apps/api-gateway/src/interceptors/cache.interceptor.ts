import { RedisService } from '@app/redis';
import {
  CallHandler,
  ExecutionContext,
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

    const fieldName = info.fieldName;
    const cacheKey = `${fieldName}`;

    return from(this.redisService.get(cacheKey)).pipe(
      switchMap((cachedData) => {
        if (cachedData) {
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
