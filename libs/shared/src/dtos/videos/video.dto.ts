import { PickleBallLevelEnum } from '@app/shared/enums/pickleball.enum';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class UploadVideoDto {
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  tags: string[];

  level?: PickleBallLevelEnum;
}
