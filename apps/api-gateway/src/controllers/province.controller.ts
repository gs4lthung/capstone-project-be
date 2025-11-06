import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProvinceService } from '../services/province.service';

@ApiTags('Locations')
@Controller('provinces')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all provinces' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Danh sách tỉnh thành' })
  async findAll() {
    return this.provinceService.findAll();
  }

  @Get(':id/districts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get districts by province id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Danh sách quận huyện' })
  async findDistrictsByProvince(@Param('id', new ParseIntPipe()) id: number) {
    return this.provinceService.findDistrictsByProvince(id);
  }
}
