export class NotificationSendDto {
  token: string;
  title: string;
  body: string;
  icon?: string;

  constructor(token: string, title: string, body: string, icon?: string) {
    this.token = token;
    this.title = title;
    this.body = body;
    this.icon = icon;
  }
}
