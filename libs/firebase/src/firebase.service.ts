import { ConfigService } from '@app/config';
import { NotificationSendDto } from '@app/shared/dtos/notifications/notification.send.dto';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private configService: ConfigService) {}
  onModuleInit() {
    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: this.configService.get('firebase').project_id,
            clientEmail: this.configService.get('firebase').client_email,
            privateKey: this.configService
              .get('firebase')
              .private_key.replace(/\\n/g, '\n'),
          }),
        });
      }
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async sendPushNotification({
    token,
    title,
    body,
    icon,
  }: NotificationSendDto) {
    try {
      const response = await admin.messaging().send({
        token,
        webpush: {
          notification: {
            title,
            body,
            icon,
          },
        },
      });
      return response;
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
