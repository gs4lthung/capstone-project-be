import { Module } from '@nestjs/common';
import { ChatServiceController } from './chat-service.controller';
import { ChatServiceService } from './chat-service.service';
import { ConfigModule } from '@app/config';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from '@app/database/entities/chat.entity';
import { ChatMember } from '@app/database/entities/chat-members.entity';
import { Message } from '@app/database/entities/message.entity';
import { MessageRead } from '@app/database/entities/message-read.entity';
import { User } from '@app/database/entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    TypeOrmModule.forFeature([Chat, ChatMember, Message, MessageRead, User]),
  ],
  controllers: [ChatServiceController],
  providers: [ChatServiceService],
})
export class MessageServiceModule {}
