import { MailSendDto } from '@app/shared/dtos/mails/mail-send.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailServiceService {
  constructor(private readonly mailService: MailerService) {}
  async sendMail(data: MailSendDto): Promise<void> {
    await this.mailService.sendMail({
      to: data.to,
      subject: data.subject,
      text: data.text,
      template: data.template,
      context: data.context,
    });
  }
}
