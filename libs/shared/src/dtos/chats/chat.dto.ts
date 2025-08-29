import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray } from 'class-validator';

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
