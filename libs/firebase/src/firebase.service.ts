import { ConfigService } from '@app/config';
import { FirebaseNotification } from '@app/firebase/firebase-notification';
import { UploadFileDto } from '@app/shared/dtos/files/file.dto';
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
  }: FirebaseNotification) {
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

  async uploadFile(data: UploadFileDto) {
    try {
      const bucket = admin.storage().bucket();
      const filePath = `${data.file.destination}/${data.file.filename}`;

      const fileUpload = bucket.file(filePath);
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: data.file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error) => reject(error));

        stream.on('finish', async () => {
          await fileUpload.makePublic();
          resolve(fileUpload.publicUrl());
        });

        stream.end(data.file.buffer);
      });
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
