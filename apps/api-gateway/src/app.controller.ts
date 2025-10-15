import { Controller, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { I18nResponseInterceptor } from './interceptors/i18-response.interceptor';

@Controller()
@UseInterceptors(I18nResponseInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}
}
