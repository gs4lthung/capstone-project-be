import { ScheduleDayOfWeek } from '@app/shared/enums/schedule.enum';
import { IsEnum, IsInt, ValidateNested } from 'class-validator';
export class ScheduleDto {
  @IsEnum(ScheduleDayOfWeek)
  dayOfWeek: ScheduleDayOfWeek;
  startTime: string;
  endTime: string;
}
export class ChangeScheduleDto {
  @IsInt()
  course: number;

  replaceScheduleId: number;

  @ValidateNested({ each: true })
  newSchedule: ScheduleDto;
}

export class SessionNewScheduleDto {
  scheduledDate: Date;
  startTime: string;
  endTime: string;
}
