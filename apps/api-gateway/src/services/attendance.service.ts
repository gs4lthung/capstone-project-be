import { Attendance } from '@app/database/entities/attendance.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class AttendanceService extends BaseTypeOrmService<Attendance> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly datasource: DataSource,
  ) {
    super(attendanceRepository);
  }

  async getLearnerAttendance(
    sessionId: number,
    learnerId: number,
  ): Promise<CustomApiResponse<Attendance>> {
    return await this.datasource.transaction(async (manager) => {
      const attendance = await manager.getRepository(Attendance).findOne({
        where: {
          session: { id: sessionId },
          user: { id: learnerId },
        },
      });
      if (!attendance) {
        throw new Error('Không tìm thấy thông tin điểm danh');
      }

      return new CustomApiResponse<Attendance>(
        HttpStatus.OK,
        'Lấy thông tin điểm danh thành công',
        attendance,
      );
    });
  }
}
