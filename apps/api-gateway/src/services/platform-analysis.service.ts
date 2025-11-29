import { Course } from '@app/database/entities/course.entity';
import { Payment } from '@app/database/entities/payment.entity';
import { SessionEarning } from '@app/database/entities/session-earning.entity';
import { User } from '@app/database/entities/user.entity';
import { Session } from '@app/database/entities/session.entity';
import { Feedback } from '@app/database/entities/feedback.entity';
import { Request } from '@app/database/entities/request.entity';
import { Coach } from '@app/database/entities/coach.entity';
import { Learner } from '@app/database/entities/learner.entity';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  MonthlyRequestDto,
  MonthlyResponseDto,
} from '@app/shared/dtos/coaches/coach.dto';
import { DashboardOverviewDto } from '@app/shared/dtos/platform-analysis/dashboard-overview.dto';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { PaymentStatus } from '@app/shared/enums/payment.enum';

import { UserRole } from '@app/shared/enums/user.enum';
import { CoachVerificationStatus } from '@app/shared/enums/coach.enum';
import { RequestStatus } from '@app/shared/enums/request.enum';
import { HttpStatus, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Not, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class PlatformAnalysisService {
  constructor(
    private readonly datasource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(SessionEarning)
    private readonly sessionEarningRepository: Repository<SessionEarning>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    @InjectRepository(Learner)
    private readonly learnerRepository: Repository<Learner>,
  ) {}

  async getMonthlyNewUsers(
    data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
    const isGetSingleMonthNewUser =
      data.month !== undefined && data.year !== undefined;
    if (isGetSingleMonthNewUser) {
      const startDate = new Date(data.year, data.month - 1, 1);
      const endDate = new Date(data.year, data.month, 0, 23, 59, 59, 999);
      const newUsers = await this.userRepository.find({
        where: {
          createdAt: Between(startDate, endDate),
          role: {
            name: Not(UserRole.ADMIN),
          },
        },
      });

      const lastMonthStartDate = new Date(data.year, data.month - 2, 1);
      const lastMonthEndDate = new Date(
        data.year,
        data.month - 1,
        0,
        23,
        59,
        59,
        999,
      );
      const lastMonthUsers = await this.userRepository.find({
        where: {
          createdAt: Between(lastMonthStartDate, lastMonthEndDate),
          role: {
            name: Not(UserRole.ADMIN),
          },
        },
      });

      const increaseFromLastMonth =
        lastMonthUsers.length === 0
          ? newUsers.length === 0
            ? 0
            : 100
          : parseFloat(
              (
                ((newUsers.length - lastMonthUsers.length) /
                  lastMonthUsers.length) *
                100
              ).toFixed(2),
            );
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              month: `${data.month}/${data.year}`,
              data: newUsers.length,
              increaseFromLastMonth,
            },
          ],
        },
      );
    } else {
      const currentYear = data.year || new Date().getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const monthlyData = [];
      for (const month of months) {
        const startDate = new Date(currentYear, month - 1, 1);
        const endDate = new Date(currentYear, month, 0, 23, 59, 59, 999);
        const newUsers = await this.userRepository.find({
          where: {
            createdAt: Between(startDate, endDate),
            role: {
              name: Not(UserRole.ADMIN),
            },
          },
        });
        monthlyData.push({
          month: `${month}/${currentYear}`,
          data: newUsers.length,
        });
      }
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: monthlyData },
      );
    }
  }

  async getMonthlyLearnerPayment(
    data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
    const isGetSingleMonthLearnerPayment =
      data.month !== undefined && data.year !== undefined;

    if (isGetSingleMonthLearnerPayment) {
      const startDate = new Date(data.year, data.month - 1, 1);
      const endDate = new Date(data.year, data.month, 0, 23, 59, 59, 999);

      const payments = await this.paymentRepository.find({
        where: {
          status: PaymentStatus.PAID,
          createdAt: Between(startDate, endDate),
        },
      });
      let paymentAmount = 0;
      for (const payment of payments) {
        paymentAmount += Number(payment.amount);
      }

      const lastMonthStartDate = new Date(data.year, data.month - 2, 1);
      const lastMonthEndDate = new Date(
        data.year,
        data.month - 1,
        0,
        23,
        59,
        59,
        999,
      );
      const lastMonthPayments = await this.paymentRepository.find({
        where: {
          status: PaymentStatus.PAID,
          createdAt: Between(lastMonthStartDate, lastMonthEndDate),
        },
      });
      let lastMonthPaymentAmount = 0;
      for (const payment of lastMonthPayments) {
        lastMonthPaymentAmount += Number(payment.amount);
      }

      const increaseFromLastMonth =
        lastMonthPaymentAmount === 0
          ? paymentAmount === 0
            ? 0
            : 100
          : parseFloat(
              (
                ((paymentAmount - lastMonthPaymentAmount) /
                  lastMonthPaymentAmount) *
                100
              ).toFixed(2),
            );
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              month: `${data.month}/${data.year}`,
              data: payments.length,
              increaseFromLastMonth,
            },
          ],
        },
      );
    } else {
      const currentYear = data.year || new Date().getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const monthlyData = [];
      for (const month of months) {
        const startDate = new Date(currentYear, month - 1, 1);
        const endDate = new Date(currentYear, month, 0, 23, 59, 59, 999);
        const payments = await this.paymentRepository.find({
          where: {
            status: PaymentStatus.PAID,
            createdAt: Between(startDate, endDate),
          },
        });
        let paymentAmount = 0;
        for (const payment of payments) {
          paymentAmount += Number(payment.amount);
        }
        monthlyData.push({
          month: `${month}/${currentYear}`,
          data: paymentAmount,
        });
      }
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: monthlyData },
      );
    }
  }

  async getMonthlyCoachSessionEarning(
    data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
    const isGetSingleMonthCoachEarning =
      data.month !== undefined && data.year !== undefined;

    if (isGetSingleMonthCoachEarning) {
      const startDate = new Date(data.year, data.month - 1, 1);
      const endDate = new Date(data.year, data.month, 0, 23, 59, 59, 999);
      const sessionEarnings = await this.sessionEarningRepository.find({
        where: {
          createdAt: Between(startDate, endDate),
        },
      });
      let sessionEarningAmount = 0;
      for (const sessionEarning of sessionEarnings) {
        sessionEarningAmount += Number(sessionEarning.coachEarningTotal);
      }

      const lastMonthStartDate = new Date(data.year, data.month - 2, 1);
      const lastMonthEndDate = new Date(
        data.year,
        data.month - 1,
        0,
        23,
        59,
        59,
        999,
      );
      const lastMonthSessionEarnings = await this.sessionEarningRepository.find(
        {
          where: {
            createdAt: Between(lastMonthStartDate, lastMonthEndDate),
          },
        },
      );
      let lastMonthSessionEarningAmount = 0;
      for (const sessionEarning of lastMonthSessionEarnings) {
        lastMonthSessionEarningAmount += Number(
          sessionEarning.coachEarningTotal,
        );
      }

      const increaseFromLastMonth =
        lastMonthSessionEarningAmount === 0
          ? sessionEarningAmount === 0
            ? 0
            : 100
          : parseFloat(
              (
                ((sessionEarningAmount - lastMonthSessionEarningAmount) /
                  lastMonthSessionEarningAmount) *
                100
              ).toFixed(2),
            );
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              month: `${data.month}/${data.year}`,
              data: sessionEarnings.length,
              increaseFromLastMonth,
            },
          ],
        },
      );
    } else {
      const currentYear = data.year || new Date().getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const monthlyData = [];

      for (const month of months) {
        const startDate = new Date(currentYear, month - 1, 1);
        const endDate = new Date(currentYear, month, 0, 23, 59, 59, 999);
        const sessionEarnings = await this.sessionEarningRepository.find({
          where: {
            createdAt: Between(startDate, endDate),
          },
        });
        let sessionEarningAmount = 0;
        for (const sessionEarning of sessionEarnings) {
          sessionEarningAmount += Number(sessionEarning.coachEarningTotal);
        }
        monthlyData.push({
          month: `${month}/${currentYear}`,
          data: sessionEarningAmount,
        });
      }
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: monthlyData,
        },
      );
    }
  }

  async getMonthlyPlatformRevenue(
    data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
    const isGetSingleMonthPlatformRevenue =
      data.month !== undefined && data.year !== undefined;
    if (isGetSingleMonthPlatformRevenue) {
      const startDate = new Date(data.year, data.month - 1, 1);
      const endDate = new Date(data.year, data.month, 0, 23, 59, 59, 999);

      const courses = await this.courseRepository.find({
        where: {
          status: CourseStatus.COMPLETED,
          startDate: Between(startDate, endDate),
        },
      });
      let platformRevenue = 0;
      for (const course of courses) {
        platformRevenue +=
          Number(course.currentParticipants) *
            Number(course.pricePerParticipant) -
          Number(course.totalEarnings);
      }

      const lastMonthStartDate = new Date(data.year, data.month - 2, 1);
      const lastMonthEndDate = new Date(
        data.year,
        data.month - 1,
        0,
        23,
        59,
        59,
        999,
      );
      const lastMonthCourses = await this.courseRepository.find({
        where: {
          status: CourseStatus.COMPLETED,
          startDate: Between(lastMonthStartDate, lastMonthEndDate),
        },
      });
      let lastMonthPlatformRevenue = 0;
      for (const course of lastMonthCourses) {
        lastMonthPlatformRevenue +=
          Number(course.currentParticipants) *
            Number(course.pricePerParticipant) -
          Number(course.totalEarnings);
      }
      const increaseFromLastMonth =
        lastMonthPlatformRevenue === 0
          ? platformRevenue === 0
            ? 0
            : 100
          : parseFloat(
              (
                ((platformRevenue - lastMonthPlatformRevenue) /
                  lastMonthPlatformRevenue) *
                100
              ).toFixed(2),
            );

      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              month: `${data.month}/${data.year}`,
              data: platformRevenue,
              increaseFromLastMonth,
            },
          ],
        },
      );
    } else {
      const currentYear = data.year || new Date().getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const monthlyData = [];
      for (const month of months) {
        const startDate = new Date(currentYear, month - 1, 1);
        const endDate = new Date(currentYear, month, 0, 23, 59, 59, 999);
        const courses = await this.courseRepository.find({
          where: {
            status: CourseStatus.COMPLETED,
            startDate: Between(startDate, endDate),
          },
        });
        let platformRevenue = 0;
        for (const course of courses) {
          platformRevenue +=
            Number(course.currentParticipants) *
              Number(course.pricePerParticipant) -
            Number(course.totalEarnings);
        }
        monthlyData.push({
          month: `${month}/${currentYear}`,
          data: platformRevenue,
        });
      }
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: monthlyData },
      );
    }
  }

  async getDashboardOverview(): Promise<
    CustomApiResponse<DashboardOverviewDto>
  > {
    // Get current date and last month date for percentage calculations
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Total Users (Coach + Learner, excluding Admin)
    const totalUsers = await this.userRepository.count({
      where: {
        role: {
          name: Not(UserRole.ADMIN),
        },
      },
    });

    const lastMonthUsers = await this.userRepository.count({
      where: {
        role: {
          name: Not(UserRole.ADMIN),
        },
        createdAt: Between(lastMonth, currentMonthStart),
      },
    });

    const currentMonthUsers = await this.userRepository.count({
      where: {
        role: {
          name: Not(UserRole.ADMIN),
        },
        createdAt: Between(currentMonthStart, now),
      },
    });

    const totalUsersPercentageChange =
      lastMonthUsers === 0
        ? currentMonthUsers === 0
          ? 0
          : 100
        : parseFloat(
            (
              ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) *
              100
            ).toFixed(2),
          );

    // 2. Coaches
    const totalCoaches = await this.coachRepository.count();
    const verifiedCoaches = await this.coachRepository.count({
      where: {
        verificationStatus: CoachVerificationStatus.VERIFIED,
      },
    });
    const pendingCoaches = await this.coachRepository.count({
      where: {
        verificationStatus: CoachVerificationStatus.PENDING,
      },
    });

    const lastMonthCoaches = await this.coachRepository.count({
      where: {
        createdAt: Between(lastMonth, currentMonthStart),
      },
    });

    const currentMonthCoaches = await this.coachRepository.count({
      where: {
        createdAt: Between(currentMonthStart, now),
      },
    });

    const coachesPercentageChange =
      lastMonthCoaches === 0
        ? currentMonthCoaches === 0
          ? 0
          : 100
        : parseFloat(
            (
              ((currentMonthCoaches - lastMonthCoaches) / lastMonthCoaches) *
              100
            ).toFixed(2),
          );

    // 3. Learners
    const totalLearners = await this.learnerRepository.count();

    // Count learners by checking their associated users' createdAt
    const lastMonthLearners = await this.userRepository.count({
      where: {
        role: {
          name: UserRole.LEARNER,
        },
        createdAt: Between(lastMonth, currentMonthStart),
      },
    });

    const currentMonthLearners = await this.userRepository.count({
      where: {
        role: {
          name: UserRole.LEARNER,
        },
        createdAt: Between(currentMonthStart, now),
      },
    });

    const learnersPercentageChange =
      lastMonthLearners === 0
        ? currentMonthLearners === 0
          ? 0
          : 100
        : parseFloat(
            (
              ((currentMonthLearners - lastMonthLearners) / lastMonthLearners) *
              100
            ).toFixed(2),
          );

    // 4. Courses
    const totalCourses = await this.courseRepository.count();
    const completedCourses = await this.courseRepository.count({
      where: {
        status: CourseStatus.COMPLETED,
      },
    });
    const ongoingCourses = await this.courseRepository.count({
      where: {
        status: CourseStatus.ON_GOING,
      },
    });
    const cancelledCourses = await this.courseRepository.count({
      where: {
        status: CourseStatus.CANCELLED,
      },
    });

    // 5. Average Feedback Rating
    const allFeedbacks = await this.feedbackRepository.find({
      select: ['rating'],
    });

    let averageRating = 0;
    if (allFeedbacks.length > 0) {
      const totalRating = allFeedbacks.reduce(
        (sum, feedback) => sum + feedback.rating,
        0,
      );
      averageRating = parseFloat(
        (totalRating / allFeedbacks.length).toFixed(2),
      );
    }

    // Calculate percentage change for feedback (compare last month vs current month)
    const lastMonthFeedbacks = await this.feedbackRepository.find({
      where: {
        createdAt: Between(lastMonth, currentMonthStart),
      },
      select: ['rating'],
    });

    const currentMonthFeedbacks = await this.feedbackRepository.find({
      where: {
        createdAt: Between(currentMonthStart, now),
      },
      select: ['rating'],
    });

    let lastMonthAvgRating = 0;
    if (lastMonthFeedbacks.length > 0) {
      const lastMonthTotal = lastMonthFeedbacks.reduce(
        (sum, feedback) => sum + feedback.rating,
        0,
      );
      lastMonthAvgRating = lastMonthTotal / lastMonthFeedbacks.length;
    }

    let currentMonthAvgRating = 0;
    if (currentMonthFeedbacks.length > 0) {
      const currentMonthTotal = currentMonthFeedbacks.reduce(
        (sum, feedback) => sum + feedback.rating,
        0,
      );
      currentMonthAvgRating = currentMonthTotal / currentMonthFeedbacks.length;
    }

    const feedbackPercentageChange =
      lastMonthAvgRating === 0
        ? currentMonthAvgRating === 0
          ? 0
          : 100
        : parseFloat(
            (
              ((currentMonthAvgRating - lastMonthAvgRating) /
                lastMonthAvgRating) *
              100
            ).toFixed(2),
          );

    // 6. System Reports (Requests)
    const pendingRequests = await this.requestRepository.count({
      where: {
        status: RequestStatus.PENDING,
      },
    });
    const approvedRequests = await this.requestRepository.count({
      where: {
        status: RequestStatus.APPROVED,
      },
    });
    const rejectedRequests = await this.requestRepository.count({
      where: {
        status: RequestStatus.REJECTED,
      },
    });

    // Charts Data
    // 1. Course Status Chart
    const courseStatusChart = [
      {
        status: CourseStatus.COMPLETED,
        count: completedCourses,
      },
      {
        status: CourseStatus.ON_GOING,
        count: ongoingCourses,
      },
      {
        status: CourseStatus.CANCELLED,
        count: cancelledCourses,
      },
      {
        status: CourseStatus.APPROVED,
        count: await this.courseRepository.count({
          where: {
            status: CourseStatus.APPROVED,
          },
        }),
      },
      {
        status: CourseStatus.READY_OPENED,
        count: await this.courseRepository.count({
          where: {
            status: CourseStatus.READY_OPENED,
          },
        }),
      },
      {
        status: CourseStatus.PENDING_APPROVAL,
        count: await this.courseRepository.count({
          where: {
            status: CourseStatus.PENDING_APPROVAL,
          },
        }),
      },
    ];

    // 3. Feedback Distribution Chart (1-5 stars)
    const feedbackDistributionChart = [];
    const totalFeedbackCount = allFeedbacks.length;

    for (let rating = 1; rating <= 5; rating++) {
      const count = allFeedbacks.filter((f) => f.rating === rating).length;
      const percentage =
        totalFeedbackCount > 0
          ? parseFloat(((count / totalFeedbackCount) * 100).toFixed(2))
          : 0;
      feedbackDistributionChart.push({
        rating,
        count,
        percentage,
      });
    }

    const dashboardData: DashboardOverviewDto = {
      totalUsers: {
        total: totalUsers,
        percentageChange: totalUsersPercentageChange,
      },
      coaches: {
        total: totalCoaches,
        percentageChange: coachesPercentageChange,
        verified: verifiedCoaches,
        pending: pendingCoaches,
      },
      learners: {
        total: totalLearners,
        percentageChange: learnersPercentageChange,
      },
      courses: {
        total: totalCourses,
        completed: completedCourses,
        ongoing: ongoingCourses,
        cancelled: cancelledCourses,
      },
      averageFeedback: {
        total: averageRating,
        percentageChange: feedbackPercentageChange,
      },
      systemReports: {
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
      },
      courseStatusChart,
      feedbackDistributionChart,
    };

    return new CustomApiResponse<DashboardOverviewDto>(
      HttpStatus.OK,
      'Success',
      dashboardData,
    );
  }
}
