import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AiSubjectGenerationService } from '../services/ai-subject-generation.service';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { UpdateAiGeneratedSubjectDto } from '@app/shared/dtos/subjects/update-ai-subject.dto';
import { AuthGuard } from '../guards/auth.guard';

@Controller('ai-subject-generations')
export class AiSubjectGenerationController {
  constructor(
    private readonly aiSubjectGenerationService: AiSubjectGenerationService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ) {
    return await this.aiSubjectGenerationService.findAll({
      pagination,
      sort,
      filter,
    });
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Body('id') id: number) {
    return await this.aiSubjectGenerationService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body('prompt') prompt: string) {
    return await this.aiSubjectGenerationService.create(prompt);
  }

  @Post('use-generated-subject/:id')
  @UseGuards(AuthGuard)
  async useGeneratedSubject(@Param('id') id: number) {
    return await this.aiSubjectGenerationService.saveNewSubject(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: number,
    @Body() data: UpdateAiGeneratedSubjectDto,
  ) {
    return await this.aiSubjectGenerationService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: number) {
    return await this.aiSubjectGenerationService.delete(id);
  }
}
