import { NotificationType } from '../enums/notification.enum';

export interface SendNotification {
  userId?: number;
  title: string;
  body: string;
  navigateTo?: string;
  type?: NotificationType;
}
