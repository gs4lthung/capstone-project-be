import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from '@app/database/entities/province.entity';
import { District } from '@app/database/entities/district.entity';

@Injectable()
export class ProvinceService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
  ) {}

  async findAll(): Promise<Province[]> {
    return this.provinceRepository.find({ withDeleted: false });
  }

  async findDistrictsByProvince(provinceId: number): Promise<District[]> {
    return this.districtRepository.find({
      where: { province: { id: provinceId } },
      withDeleted: false,
    });
  }
}
