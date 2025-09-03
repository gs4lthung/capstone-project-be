import { ChatMember } from '@app/database/entities/chat-members.entity';
import { Chat } from '@app/database/entities/chat.entity';
import { User } from '@app/database/entities/user.entity';
import {
  CreatePersonalChatDto,
  SendMessageDto,
} from '@app/shared/dtos/chats/chat.dto';
import { ChatMessageType, ChatTypeEnum } from '@app/shared/enums/chat.enum';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DeepPartial, Not } from 'typeorm';
import { Message } from '@app/database/entities/message.entity';
import { MessageRead } from '@app/database/entities/message-read.entity';

@Injectable()
export class ChatServiceService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,

    @InjectRepository(ChatMember)
    private readonly chatMemberRepository: Repository<ChatMember>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(MessageRead)
    private readonly messageReadRepository: Repository<MessageRead>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async createPersonalChat(
    data: CreatePersonalChatDto,
  ): Promise<CustomApiResponse<void>> {
    try {
      const isValidParticipants = await this.userRepository.countBy({
        id: In(data.participants),
      });
      if (isValidParticipants < data.participants.length) {
        throw new CustomRpcException(
          'INVALID_PARTICIPANTS',
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingChat = await this.chatRepository
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.members', 'member')
        .where('chat.type = :type', { type: ChatTypeEnum.PERSONAL })
        .andWhere('member.userId IN (:...userIds)', {
          userIds: data.participants,
        })
        .getOne();

      if (existingChat) {
        throw new CustomRpcException(
          'CHAT_ALREADY_EXIST',
          HttpStatus.BAD_REQUEST,
        );
      }

      const newChat = this.chatRepository.create({
        type: ChatTypeEnum.PERSONAL,
        createdBy: { id: data.createdBy },
      });

      const newMembers = data.participants.map((userId) => ({
        user: { id: userId },
        chat: newChat,
      })) as ChatMember[];

      newChat.members = newMembers;

      await this.chatRepository.save(newChat);

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'Personal chat created successfully',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async sendMessage(
    userId: number,
    data: SendMessageDto,
    files: {
      chat_image?: Express.Multer.File[];
      chat_video?: Express.Multer.File[];
    },
  ): Promise<User[]> {
    try {
      const chat = await this.chatRepository.findOne({
        where: { id: data.chatId },
        withDeleted: false,
      });
      if (!chat)
        throw new CustomRpcException('CHAT_NOT_FOUND', HttpStatus.NOT_FOUND);

      const isChatMember = await this.chatMemberRepository.countBy({
        user: { id: userId },
        chat: { id: data.chatId },
      });
      if (!isChatMember)
        throw new CustomRpcException('USER_NOT_IN_CHAT', HttpStatus.FORBIDDEN);

      let messageData = {
        chat,
        sender: { id: userId },
      } as DeepPartial<Message>;

      switch (data.type) {
        case ChatMessageType.TEXT:
          data.message = data.message.trim();
          messageData = {
            ...messageData,
            text: data.message,
            type: data.type,
          };
          break;
        case ChatMessageType.IMAGE:
          messageData = {
            ...messageData,
            type: data.type,
            mediaUrl: data.message,
          };
          break;
        case ChatMessageType.VIDEO:
          messageData = {
            ...messageData,
            type: data.type,
            mediaUrl: data.message,
          };
          break;
      }

      const newMessage = this.messageRepository.create({
        ...messageData,
      });

      await this.messageRepository.save(newMessage);

      const anotherMembers = await this.chatMemberRepository.find({
        where: {
          chat: { id: data.chatId },
          user: { id: Not(userId) },
        },
      });

      return anotherMembers.map((member) => member.user);
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async findByUser(userId: number): Promise<Chat[]> {
    try {
      const chats = await this.chatRepository.find({
        where: {
          members: {
            user: { id: userId },
          },
        },
        withDeleted: false,
      });
      return chats;
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
