import { ChatMember } from '@app/database/entities/chat-members.entity';
import { Chat } from '@app/database/entities/chat.entity';
import { User } from '@app/database/entities/user.entity';
import { CreatePersonalChatDto } from '@app/shared/dtos/chats/chat.dto';
import { ChatTypeEnum } from '@app/shared/enums/chat.enum';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

@Injectable()
export class ChatServiceService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,

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
}
