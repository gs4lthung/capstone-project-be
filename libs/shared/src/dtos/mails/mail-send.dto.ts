export class MailSendDto {
  to: string;
  subject: string;
  text: string;
  template: string;
  context: Record<string, any>;
}
