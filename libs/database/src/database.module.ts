import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@app/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Error } from './entities/error.entity';
import { AuthProvider } from './entities/auth-provider.entity';
import { FcmToken } from './entities/fcmToken.entity';
import { Notification } from './entities/notification.entity';
import { Order } from './entities/order.entity';
import { Role } from './entities/role.entity';
import { Chat } from './entities/chat.entity';
import { ChatMember } from './entities/chat-members.entity';
import { Message } from './entities/message.entity';
import { MessageRead } from './entities/message-read.entity';
import { Video } from './entities/video.entity';
import { CoachProfile } from './entities/coach_profile.entity';
import { CoachCredential } from './entities/coach_credential.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database').host,
        port: configService.get('database').port,
        username: configService.get('database').username,
        password: configService.get('database').password,
        database: configService.get('database').database,
        entities: [
          User,
          Error,
          AuthProvider,
          FcmToken,
          Notification,
          Order,
          Role,
          Chat,
          ChatMember,
          Message,
          MessageRead,
          Video,
          CoachProfile,
          CoachCredential,
        ],
        logging: false,
        synchronize: configService.get('node_env') === 'dev',
        ssl:
          configService.get('node_env') !== 'dev'
            ? { rejectUnauthorized: false }
            : false,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
