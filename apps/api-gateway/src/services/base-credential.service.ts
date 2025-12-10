import { BunnyService } from '@app/bunny';
import { BaseCredential } from '@app/database/entities/base-credential.entity';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  CreateBaseCredentialDto,
  UpdateBaseCredentialDto,
} from '@app/shared/dtos/base-credentials/base-credential.dto';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { CryptoUtils } from '@app/shared/utils/crypto.util';
import { BadRequestException, Injectable, Scope } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class BaseCredentialService extends BaseTypeOrmService<BaseCredential> {
  constructor(
    private readonly datasource: DataSource,
    private readonly bunnyService: BunnyService,
  ) {
    super(datasource.getRepository(BaseCredential));
  }

  async findAll(
    findOptions: FindOptions,
  ): Promise<PaginateObject<BaseCredential>> {
    return await super.find(
      findOptions,
      'baseCredential',
      PaginateObject<BaseCredential>,
    );
  }

  async create(
    data: CreateBaseCredentialDto,
    file?: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      if (file) {
        const publicUrl = await this.bunnyService.uploadToStorage({
          id: CryptoUtils.generateRandomNumber(100_000, 999_999),
          filePath: file.path,
          type: 'base_credential_image',
        });
        data['publicUrl'] = publicUrl;
      }
      const newBaseCredential = manager
        .getRepository(BaseCredential)
        .create(data);
      await manager.getRepository(BaseCredential).save(newBaseCredential);
      return new CustomApiResponse<void>(null, 'Tạo chứng chỉ thành công');
    });
  }

  async update(
    id: number,
    data: UpdateBaseCredentialDto,
    file?: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const baseCredential = await manager
        .getRepository(BaseCredential)
        .findOneBy({ id });
      if (!baseCredential) {
        throw new BadRequestException('Chứng chỉ không tồn tại');
      }
      if (file) {
        const publicUrl = await this.bunnyService.uploadToStorage({
          id: CryptoUtils.generateRandomNumber(100_000, 999_999),
          filePath: file.path,
          type: 'base_credential_image',
        });
        data['publicUrl'] = publicUrl;
      }
      manager.getRepository(BaseCredential).merge(baseCredential, data);
      await manager.getRepository(BaseCredential).save(baseCredential);
      return new CustomApiResponse<void>(null, 'Cập nhật chứng chỉ thành công');
    });
  }

  async delete(id: number): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const baseCredential = await manager
        .getRepository(BaseCredential)
        .findOneBy({ id });
      if (!baseCredential) {
        throw new BadRequestException('Chứng chỉ không tồn tại');
      }
      await manager.getRepository(BaseCredential).remove(baseCredential);
      return new CustomApiResponse<void>(null, 'Xoá chứng chỉ thành công');
    });
  }

  async findById(id: number): Promise<BaseCredential> {
    return await this.datasource
      .getRepository(BaseCredential)
      .findOneBy({ id });
  }
}
