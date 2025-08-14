import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty({
    description: 'Title of the notification',
    example: 'New Message',
  })
  title: string;

  @ApiProperty({
    description: 'Body of the notification',
    example: 'You have received a new message.',
  })
  body: string;
}
