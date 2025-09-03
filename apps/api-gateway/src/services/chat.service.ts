import { Chat } from '@app/database/entities/chat.entity';

import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  CreatePersonalChatDto,
  SendMessageDto,
} from '@app/shared/dtos/chats/chat.dto';
import { ChatMsgPattern } from '@app/shared/msg_patterns/chat.msg_pattern';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable({ scope: Scope.REQUEST })
export class ChatService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @Inject('CHAT_SERVICE') private readonly chatService: ClientProxy,
  ) {}
  async createPersonalChat(data: CreatePersonalChatDto) {
    const pattern = { cmd: ChatMsgPattern.CREATE_PERSONAL_CHAT };
    const payload = {
      ...data,
      createdBy: this.request.user.id,
    } as CreatePersonalChatDto;

    const response = await lastValueFrom(
      this.chatService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }

  async sendMessage(
    data: SendMessageDto,
    files: {
      chat_image?: Express.Multer.File[];
      chat_video?: Express.Multer.File[];
    },
  ) {
    const pattern = { cmd: ChatMsgPattern.SEND_MESSAGE };
    const payload = {
      userId: this.request.user.id,
      data,
      files,
    };

    const response = await lastValueFrom(
      this.chatService.send<CustomApiResponse<void>>(pattern, payload),
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
