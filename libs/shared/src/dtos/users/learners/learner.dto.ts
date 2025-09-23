import { PickleBallLevelEnum } from '@app/shared/enums/pickleball.enum';
import { IsEnum, IsLatitude, IsLongitude } from 'class-validator';

export class CreateLearnerProfileDto {
  location?: string;
  @IsLatitude()
  latitude?: number;

  @IsLongitude()
  longitude?: number;

  @IsEnum(PickleBallLevelEnum)
  pickleballLevel: PickleBallLevelEnum;

  @IsEnum(PickleBallLevelEnum)
  pickleballLearnerGoal: PickleBallLevelEnum;
}
