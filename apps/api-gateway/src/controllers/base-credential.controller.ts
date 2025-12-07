import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BaseCredentialService } from '../services/base-credential.service';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import {
  CreateBaseCredentialDto,
  UpdateBaseCredentialDto,
} from '@app/shared/dtos/base-credentials/base-credential.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeLimitEnum } from '@app/shared/enums/file.enum';

@Controller('base-credentials')
export class BaseCredentialController {
  constructor(private readonly baseCredentialService: BaseCredentialService) {}

  @Get()
  async findAll(
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ) {
    return this.baseCredentialService.findAll({
      pagination,
      sort,
      filter,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.baseCredentialService.findById(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('base_credential_image', {
      limits: { fileSize: FileSizeLimitEnum.IMAGE },
    }),
  )
  async create(
    @Body() data: CreateBaseCredentialDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.baseCredentialService.create(data, file);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: UpdateBaseCredentialDto) {
    return this.baseCredentialService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.baseCredentialService.delete(id);
  }
}
