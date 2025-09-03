import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePersonalChatDto } from '@app/shared/dtos/chats/chat.dto';
import { AuthGuard } from '../guards/auth.guard';
import { ChatService } from '../services/chat.service';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { User } from '@app/database/entities/user.entity';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Post('personal')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Chat'],
    summary: 'Create Personal Chat',
    description: 'Create a new personal chat',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Personal chat created successfully',
  })
  async createPersonalChat(
    @CurrentUser('local') user: User,
    @Body()
    data: CreatePersonalChatDto,
  ) {
    return this.chatService.createPersonalChat(user.id, data);
  }
}
