import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

// Summary Cards DTOs
export class SummaryCardDto {
  @ApiProperty({ example: 1000, description: 'Total count' })
  total: number;

  @ApiProperty({ example: 5.5, description: 'Percentage change from last period', required: false })
  @IsOptional()
  @IsNumber()
  percentageChange?: number;
}

export class CoachSummaryDto extends SummaryCardDto {
  @ApiProperty({ example: 50, description: 'Number of verified coaches' })
  verified: number;

  @ApiProperty({ example: 10, description: 'Number of pending coaches' })
  pending: number;
}

export class CourseSummaryDto {
  @ApiProperty({ example: 500, description: 'Total courses' })
  total: number;

  @ApiProperty({ example: 300, description: 'Completed courses' })
  completed: number;

  @ApiProperty({ example: 150, description: 'Ongoing courses' })
  ongoing: number;

  @ApiProperty({ example: 50, description: 'Cancelled courses' })
  cancelled: number;
}

export class SystemReportDto {
  @ApiProperty({ example: 25, description: 'Total pending requests/tickets' })
  pending: number;

  @ApiProperty({ example: 10, description: 'Total approved requests' })
  approved: number;

  @ApiProperty({ example: 5, description: 'Total rejected requests' })
  rejected: number;
}

// Charts DTOs
export class CourseStatusDataDto {
  @ApiProperty({ example: 'COMPLETED', description: 'Course status' })
  status: string;

  @ApiProperty({ example: 300, description: 'Number of courses' })
  count: number;
}

export class FeedbackDistributionDataDto {
  @ApiProperty({ example: 5, description: 'Rating (1-5)' })
  rating: number;

  @ApiProperty({ example: 100, description: 'Number of feedbacks with this rating' })
  count: number;

  @ApiProperty({ example: 25.5, description: 'Percentage of total feedbacks' })
  percentage: number;
}

// Main Dashboard Overview DTO
export class DashboardOverviewDto {
  @ApiProperty({ description: 'Total users summary' })
  totalUsers: SummaryCardDto;

  @ApiProperty({ description: 'Coaches summary' })
  coaches: CoachSummaryDto;

  @ApiProperty({ description: 'Learners summary' })
  learners: SummaryCardDto;

  @ApiProperty({ description: 'Courses summary' })
  courses: CourseSummaryDto;

  @ApiProperty({ description: 'Average feedback rating' })
  averageFeedback: SummaryCardDto;

  @ApiProperty({ description: 'System reports summary' })
  systemReports: SystemReportDto;

  @ApiProperty({ description: 'Course status chart data', type: [CourseStatusDataDto] })
  courseStatusChart: CourseStatusDataDto[];

  @ApiProperty({ description: 'Feedback distribution chart data', type: [FeedbackDistributionDataDto] })
  feedbackDistributionChart: FeedbackDistributionDataDto[];
}

