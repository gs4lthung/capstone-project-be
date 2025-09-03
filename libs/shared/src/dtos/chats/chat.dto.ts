import {
  ChatMemberRole,
  ChatMessageType,
  ChatTypeEnum,
} from '@app/shared/enums/chat.enum';
import { Field, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { UserDto } from '../users/user.dto';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';

@ObjectType()
export class ChatDto {
  @Field(() => Number)
  id: number;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String)
  type: ChatTypeEnum;

  @Field(() => UserDto)
  createdBy: UserDto;

  @Field(() => GqlCustomDateTime)
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  updatedAt: Date;

  @Field(() => [ChatMemberDto], { nullable: true })
  members: ChatMemberDto[];
}

@ObjectType()
export class ChatMemberDto {
  @Field(() => UserDto)
  user: UserDto;

  @Field(() => String)
  role: ChatMemberRole;

  @Field(() => GqlCustomDateTime)
  joinedAt: Date;
}
export class CreatePersonalChatDto {
  @ApiProperty({
    description: 'List of participant user IDs',
    example: [1, 2],
  })
  @IsArray({
    message: 'Participants must be an array of user IDs',
  })
  @ArrayMaxSize(2, {
    message: 'A personal chat can only have two participants',
  })
  @ArrayMinSize(2, {
    message: 'A personal chat must have two participants',
  })
  participants: number[];

  createdBy?: number;
}

export class SendMessageDto {
  @IsNotEmpty()
  message: string;

  @IsEnum(ChatMessageType)
  type: ChatMessageType;

  @IsNotEmpty()
  chatId: number;
}
