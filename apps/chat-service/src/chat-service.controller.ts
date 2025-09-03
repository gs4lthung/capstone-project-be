import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreatePersonalChatDto,
  SendMessageDto,
} from '@app/shared/dtos/chats/chat.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { ChatServiceService } from './chat-service.service';
import { Chat } from '@app/database/entities/chat.entity';
import { ChatMsgPattern } from '@app/shared/msg_patterns/chat.msg_pattern';
import { User } from '@app/database/entities/user.entity';

@Controller()
export class ChatServiceController {
  constructor(private readonly chatServiceService: ChatServiceService) {}

  @MessagePattern({ cmd: ChatMsgPattern.CREATE_PERSONAL_CHAT })
  async createPersonalChat(
    @Payload() data: CreatePersonalChatDto,
  ): Promise<CustomApiResponse<void>> {
    return this.chatServiceService.createPersonalChat(data);
  }

  @EventPattern({ cmd: ChatMsgPattern.SEND_MESSAGE })
  async sendMessage(
    @Payload()
    {
      userId,
      data,
      files,
    }: {
      userId: number;
      data: SendMessageDto;
      files: {
        chat_image?: Express.Multer.File[];
        chat_video?: Express.Multer.File[];
      };
    },
  ): Promise<User[]> {
    return this.chatServiceService.sendMessage(userId, data, files);
  }

  @MessagePattern({ cmd: ChatMsgPattern.FIND_USER_CHATS })
  async findByUser(data: { userId: number }): Promise<Chat[]> {
    return this.chatServiceService.findByUser(data.userId);
  }
}
