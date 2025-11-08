import { AttendanceStatus } from '@app/shared/enums/attendance.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, ValidateNested } from 'class-validator';

export class CompleteSessionDto {
  @ApiProperty({
    description: 'List of attendances for the session',
    example: [{ userId: 1, status: AttendanceStatus.PRESENT }],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateAttendanceDto)
  attendances: CreateAttendanceDto[];
}

export class CreateAttendanceDto {
  @ApiProperty({
    description: 'The ID of the user',
    type: Number,
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    description: 'The attendance status of the user',
    enum: AttendanceStatus,
  })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class GetSessionForWeeklyCalendarRequestDto {
  @ApiProperty({
    description: 'The start date of the week',
    example: '2024-06-05',
  })
  startDate: string;

  @ApiProperty({
    description: 'The end date of the week',
    example: '2024-06-11',
  })
  endDate: string;
}
