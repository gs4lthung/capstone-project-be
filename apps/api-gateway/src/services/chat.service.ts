import { Chat } from '@app/database/entities/chat.entity';
import { User } from '@app/database/entities/user.entity';

import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  CreatePersonalChatDto,
  SendMessageDto,
} from '@app/shared/dtos/chats/chat.dto';
import { ChatMsgPattern } from '@app/shared/msg_patterns/chat.msg_pattern';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ChatService {
  constructor(
    @Inject('CHAT_SERVICE') private readonly chatService: ClientProxy,
  ) {}
  async createPersonalChat(userId: number, data: CreatePersonalChatDto) {
    const pattern = { cmd: ChatMsgPattern.CREATE_PERSONAL_CHAT };
    const payload = {
      ...data,
      createdBy: userId,
    } as CreatePersonalChatDto;

    const response = await lastValueFrom(
      this.chatService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async sendMessage(
    userId: number,
    data: SendMessageDto,
    files?: {
      chat_image?: Express.Multer.File[];
      chat_video?: Express.Multer.File[];
    },
  ) {
    const pattern = { cmd: ChatMsgPattern.SEND_MESSAGE };
    const payload = {
      userId,
      data,
      files,
    };

    const response = await lastValueFrom(
      this.chatService.send<User[]>(pattern, payload),
    );
    return response;
  }

  async findUserChats(userId: number): Promise<Chat[]> {
    const pattern = { cmd: ChatMsgPattern.FIND_USER_CHATS };
    const payload = { userId };

    const response = await lastValueFrom(
      this.chatService.send<Chat[]>(pattern, payload),
    );
    return response;
  }
}
