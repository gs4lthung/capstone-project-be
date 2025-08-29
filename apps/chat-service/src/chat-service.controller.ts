import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreatePersonalChatDto } from '@app/shared/dtos/chats/chat.dto';
import { CustomApiResponse } from '@app/shared/interfaces/responses/custom-api.response';
import { ChatServiceService } from './chat-service.service';

@Controller()
export class ChatServiceController {
  constructor(private readonly chatServiceService: ChatServiceService) {}

  @MessagePattern({ cmd: 'create_personal_chat' })
  async createPersonalChat(
    @Payload() data: CreatePersonalChatDto,
  ): Promise<CustomApiResponse<void>> {
    return this.chatServiceService.createPersonalChat(data);
  }
}
