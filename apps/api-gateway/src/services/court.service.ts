import { Court } from '@app/database/entities/court.entity';
import { Province } from '@app/database/entities/province.entity';
import { District } from '@app/database/entities/district.entity';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import {
  CreateCourtDto,
  UpdateCourtDto,
} from '@app/shared/dtos/courts/court.dto';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { FilterRule } from '@app/shared/enums/filter-rules.enum';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Scope,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class CourtService extends BaseTypeOrmService<Court> {
  constructor(
    private readonly datasource: DataSource,
    @InjectRepository(Court)
    private readonly courtRepository: Repository<Court>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
  ) {
    super(courtRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginateObject<Court>> {
    const activeFilter: Filtering = {
      // Dùng tên cột trong DB để tránh lỗi "column court.is_active does not exist"
      property: 'is_active',
      rule: FilterRule.EQUALS,
      value: 'true',
    };

    const existingFilter = findOptions.filter;
    const mergedFindOptions: FindOptions = {
      ...findOptions,
      // Cast to any because at runtime we support both single and array filters
      filter: (existingFilter
        ? Array.isArray(existingFilter)
          ? [...existingFilter, activeFilter]
          : [existingFilter, activeFilter]
        : activeFilter) as any,
    };

    return super.find(mergedFindOptions, 'court', PaginateObject<Court>);
  }

  async findAllIncludingInactive(
    findOptions: FindOptions,
  ): Promise<PaginateObject<Court>> {
    // Không thêm filter isActive, lấy tất cả courts
    return super.find(findOptions, 'court', PaginateObject<Court>);
  }

  async findOne(id: number): Promise<CustomApiResponse<Court>> {
    return new CustomApiResponse<Court>(
      HttpStatus.OK,
      'Court retrieved successfully',
      await this.courtRepository.findOne({
        where: { id: id, isActive: true },
        withDeleted: false,
      }),
    );
  }

  async create(data: CreateCourtDto): Promise<CustomApiResponse<Court>> {
    return await this.datasource.transaction(async (manager) => {
      // Validate province
      const province = await manager
        .getRepository(Province)
        .findOne({ where: { id: data.provinceId } });
      if (!province) {
        throw new BadRequestException('Không tìm thấy tỉnh thành');
      }

      // Validate district
      const district = await manager.getRepository(District).findOne({
        where: { id: data.districtId },
        relations: ['province'],
      });
      if (!district) {
        throw new BadRequestException('Không tìm thấy quận huyện');
      }

      // Validate district belongs to province
      if (district.province && district.province.id !== data.provinceId) {
        throw new BadRequestException('Quận huyện không thuộc tỉnh thành');
      }

      const courtRepository = manager.getRepository(Court);

      const existingCourt = await courtRepository.findOne({
        where: {
          name: data.name,
          province: { id: province.id },
          district: { id: district.id },
        },
        relations: ['province', 'district'],
        withDeleted: false,
      });

      if (!existingCourt) {
        throw new NotFoundException('Không tìm thấy sân để cập nhật');
      }

      if (data.phoneNumber && data.phoneNumber !== existingCourt.phoneNumber) {
        const existingByPhone = await courtRepository.findOne({
          where: { phoneNumber: data.phoneNumber },
          withDeleted: false,
        });
        if (existingByPhone && existingByPhone.id !== existingCourt.id) {
          throw new BadRequestException('Số điện thoại đã được sử dụng');
        }
        existingCourt.phoneNumber = data.phoneNumber;
      }

      existingCourt.pricePerHour = data.pricePerHour;
      existingCourt.isActive = true;

      const savedCourt = await courtRepository.save(existingCourt);

      return new CustomApiResponse<Court>(
        HttpStatus.OK,
        'Tạo sân thành công',
        savedCourt,
      );
    });
  }

  async update(
    id: number,
    data: UpdateCourtDto,
  ): Promise<CustomApiResponse<Court>> {
    return await this.datasource.transaction(async (manager) => {
      const court = await manager.getRepository(Court).findOne({
        where: { id },
        withDeleted: false,
      });

      if (!court) {
        throw new NotFoundException('Không tìm thấy sân');
      }

      const updatePayload: Partial<Court> = {};

      // Update name
      if (data.name !== undefined) {
        updatePayload.name = data.name;
      }

      // Update phone number with uniqueness check
      if (data.phoneNumber !== undefined) {
        if (data.phoneNumber && data.phoneNumber !== court.phoneNumber) {
          const existingCourt = await manager.getRepository(Court).findOne({
            where: { phoneNumber: data.phoneNumber },
            withDeleted: false,
          });
          if (existingCourt && existingCourt.id !== id) {
            throw new BadRequestException('Số điện thoại đã được sử dụng');
          }
        }
        updatePayload.phoneNumber = data.phoneNumber;
      }

      // Update price per hour
      if (data.pricePerHour !== undefined) {
        updatePayload.pricePerHour = data.pricePerHour;
      }

      // Update public URL
      if (data.publicUrl !== undefined) {
        updatePayload.publicUrl = data.publicUrl;
      }

      // Update address
      if (data.address !== undefined) {
        updatePayload.address = data.address;
      }

      // Update coordinates
      if (data.latitude !== undefined) {
        updatePayload.latitude = data.latitude;
      }
      if (data.longitude !== undefined) {
        updatePayload.longitude = data.longitude;
      }

      // Update active status
      if (data.isActive !== undefined) {
        updatePayload.isActive = data.isActive;
      }

      // Update province
      if (data.provinceId !== undefined) {
        const province = await manager
          .getRepository(Province)
          .findOne({ where: { id: data.provinceId } });
        if (!province) {
          throw new BadRequestException('Không tìm thấy tỉnh thành');
        }
        updatePayload.province = province;
      }

      // Update district
      if (data.districtId !== undefined) {
        const district = await manager.getRepository(District).findOne({
          where: { id: data.districtId },
          relations: ['province'],
        });
        if (!district) {
          throw new BadRequestException('Không tìm thấy quận huyện');
        }

        // Validate district belongs to province
        const provinceId =
          data.provinceId !== undefined ? data.provinceId : court.province?.id;
        if (district.province && district.province.id !== provinceId) {
          throw new BadRequestException('Quận huyện không thuộc tỉnh thành');
        }

        updatePayload.district = district;

        // If province wasn't updated but district was, update province from district
        if (data.provinceId === undefined && district.province) {
          updatePayload.province = district.province;
        }
      }

      // Apply updates
      await manager.getRepository(Court).update(id, updatePayload);

      // Fetch updated court
      const updatedCourt = await manager.getRepository(Court).findOne({
        where: { id },
        relations: ['province', 'district'],
      });

      return new CustomApiResponse<Court>(
        HttpStatus.OK,
        'Cập nhật sân thành công',
        updatedCourt,
      );
    });
  }

  async delete(id: number): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const court = await manager.getRepository(Court).findOne({
        where: { id },
      });

      if (!court) {
        throw new NotFoundException('Không tìm thấy sân');
      }

      court.isActive = false;
      await manager.getRepository(Court).save(court);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Cập nhật trạng thái sân thành không hoạt động',
      );
    });
  }
}
