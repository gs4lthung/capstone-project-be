import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronJobService {
  private readonly logger = new Logger(CronJobService.name);

  @Cron('* * * * *')
  handleCron() {
    this.logger.debug('Called every minute');
  }
}
