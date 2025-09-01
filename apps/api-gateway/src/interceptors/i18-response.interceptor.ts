import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { I18nContext } from 'nestjs-i18n';
import { map, Observable } from 'rxjs';

@Injectable()
export class I18nResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const i18nCtx = I18nContext.current(context);
    return next.handle().pipe(
      map((response) => {
        response = plainToInstance(CustomApiResponse, response);
        if (response instanceof CustomApiResponse) {
          response.message = i18nCtx.t(`messages.${response.message}`, {
            lang: I18nContext.current(context).lang,
          });
        }
        return response;
      }),
    );
  }
}
