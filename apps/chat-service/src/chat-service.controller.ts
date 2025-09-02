import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreatePersonalChatDto,
  SendMessageDto,
} from '@app/shared/dtos/chats/chat.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { ChatServiceService } from './chat-service.service';
import { Chat } from '@app/database/entities/chat.entity';

@Controller()
export class ChatServiceController {
  constructor(private readonly chatServiceService: ChatServiceService) {}

  @MessagePattern({ cmd: 'create_personal_chat' })
  async createPersonalChat(
    @Payload() data: CreatePersonalChatDto,
  ): Promise<CustomApiResponse<void>> {
    return this.chatServiceService.createPersonalChat(data);
  }

  @MessagePattern({ cmd: 'send_message' })
  async sendMessage({
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
  }): Promise<CustomApiResponse<void>> {
    return this.chatServiceService.sendMessage(userId, data, files);
  }

  @MessagePattern({ cmd: 'find_user_chats' })
  async findByUser(data: { userId: number }): Promise<Chat[]> {
    return this.chatServiceService.findByUser(data.userId);
  }
}
