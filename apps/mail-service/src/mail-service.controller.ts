import { Controller } from '@nestjs/common';
import { MailServiceService } from './mail-service.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MailSendDto } from '@app/shared/dtos/mails/mail-send.dto';

@Controller()
export class MailServiceController {
  constructor(private readonly mailServiceService: MailServiceService) {}

  @EventPattern({ cmd: 'send_mail' })
  async sendMail(@Payload() data: MailSendDto): Promise<void> {
    return this.mailServiceService.sendMail(data);
  }
}
