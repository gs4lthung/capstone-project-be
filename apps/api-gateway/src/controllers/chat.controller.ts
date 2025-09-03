import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreatePersonalChatDto,
  SendMessageDto,
} from '@app/shared/dtos/chats/chat.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileSizeLimitEnum } from '@app/shared/enums/file.enum';
import { AuthGuard } from '../guards/auth.guard';
import { ChatService } from '../services/chat.service';

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
    @Body()
    data: CreatePersonalChatDto,
  ) {
    return this.chatService.createPersonalChat(data);
  }

  @Post('chats/:id')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'chat_image', maxCount: 1 },
        { name: 'chat_video', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: FileSizeLimitEnum.VIDEO,
        },
      },
    ),
  )
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Chat'],
    summary: 'Send Message',
    description: 'Send a message in a chat',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Message sent successfully',
  })
  async createGroupChat(
    @UploadedFiles()
    files: {
      chat_image?: Express.Multer.File[];
      chat_video?: Express.Multer.File[];
    },
    @Param('id') id: number,
    @Body()
    data: SendMessageDto,
  ) {
    data.chatId = id;
    return this.chatService.sendMessage(data, files);
  }
}
