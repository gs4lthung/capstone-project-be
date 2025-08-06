export class MailSendDto {
  to: string;
  subject: string;
  text: string;
  template?: string;
  context?: Record<string, any>;

  constructor(
    to: string,
    subject: string,
    text: string,
    template?: string,
    context?: Record<string, any>,
  ) {
    this.to = to;
    this.subject = subject;
    this.text = text;
    this.template = template;
    this.context = context;
  }
}
