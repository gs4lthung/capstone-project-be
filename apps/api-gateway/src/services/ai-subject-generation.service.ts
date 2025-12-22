import {
  AiSubjectGeneration,
  AiSubjectGenerationStatus,
} from '@app/database/entities/ai-subject-generation.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { UpdateAiGeneratedSubjectDto } from '@app/shared/dtos/subjects/update-ai-subject.dto';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AiGeminiService } from './ai-gemini.service';
import { User } from '@app/database/entities/user.entity';
import { SubjectStatus } from '@app/shared/enums/subject.enum';
import { Subject } from '@app/database/entities/subject.entity';
import { CoachVideoStatus } from '@app/shared/enums/coach.enum';

@Injectable({ scope: Scope.REQUEST })
export class AiSubjectGenerationService extends BaseTypeOrmService<AiSubjectGeneration> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(AiSubjectGeneration)
    private readonly aiSubjectGenerationRepository: Repository<AiSubjectGeneration>,
    private readonly datasource: DataSource,
    private readonly aiGeminiService: AiGeminiService,
  ) {
    super(aiSubjectGenerationRepository);
  }

  async findAll(
    findOptions: FindOptions,
  ): Promise<PaginateObject<AiSubjectGeneration>> {
    return super.find(
      findOptions,
      'ai_subject_generation',
      PaginateObject<AiSubjectGeneration>,
    );
  }

  async findOne(id: number): Promise<AiSubjectGeneration> {
    const generation = await this.aiSubjectGenerationRepository.findOne({
      where: { id },
      relations: ['requestedBy'],
    });
    if (!generation) {
      throw new BadRequestException('Không tìm thấy bản tạo AI');
    }
    if (generation.requestedBy.id !== this.request.user.id) {
      throw new ForbiddenException('Không có quyền truy cập bản tạo này');
    }
    return generation;
  }

  async create(prompt: string): Promise<AiSubjectGeneration> {
    const aiResponse =
      await this.aiGeminiService.generateSubjectFromPrompt(prompt);

    const aiGeneration = this.aiSubjectGenerationRepository.create({
      prompt,
      generatedData: aiResponse,
      status: AiSubjectGenerationStatus.PENDING,
      requestedBy: { id: this.request.user.id } as User,
    });
    await this.aiSubjectGenerationRepository.save(aiGeneration);

    return aiGeneration;
  }

  async saveNewSubject(id: number): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const aiGeneration = await manager
        .getRepository(AiSubjectGeneration)
        .findOne({
          where: { id },
          relations: ['requestedBy'],
        });
      if (!aiGeneration) {
        throw new BadRequestException('Không tìm thấy bản tạo AI');
      }
      if (aiGeneration.requestedBy.id !== this.request.user.id) {
        throw new ForbiddenException('Không có quyền sử dụng bản tạo này');
      }
      const newSubject = manager.getRepository(Subject).create({
        isAIGenerated: true,
        name: aiGeneration.generatedData.name,
        description: aiGeneration.generatedData.description,
        level: aiGeneration.generatedData.level,
        status: SubjectStatus.DRAFT,
        lessons: aiGeneration.generatedData.lessons,
        createdBy: aiGeneration.requestedBy,
      });
      await manager.getRepository(Subject).save(newSubject);

      aiGeneration.status = AiSubjectGenerationStatus.USED;
      aiGeneration.createdSubject = newSubject;
      await manager.getRepository(AiSubjectGeneration).save(aiGeneration);
      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'Đã lưu tài liệu được tạo bởi AI thành công',
      );
    });
  }
  async update(
    id: number,
    data: UpdateAiGeneratedSubjectDto,
  ): Promise<CustomApiResponse<AiSubjectGeneration>> {
    return await this.datasource.transaction(async (manager) => {
      const generation = await manager
        .getRepository(AiSubjectGeneration)
        .findOne({
          where: { id },
          relations: ['requestedBy', 'createdSubject'],
        });

      if (!generation) {
        throw new BadRequestException('Không tìm thấy bản tạo AI');
      }

      if (generation.requestedBy.id !== this.request.user.id) {
        throw new ForbiddenException('Không có quyền chỉnh sửa bản tạo này');
      }

      if (generation.status === AiSubjectGenerationStatus.USED) {
        throw new BadRequestException(
          'Bản tạo này đã được sử dụng, không thể chỉnh sửa',
        );
      }

      for (const lesson of data.lessons) {
        for (const question of lesson.quiz.questions) {
          const correctCount = question.options.filter(
            (opt) => opt.isCorrect,
          ).length;
          if (correctCount !== 1) {
            throw new BadRequestException(
              `Câu hỏi "${question.title}" phải có đúng 1 đáp án đúng`,
            );
          }
        }
      }

      generation.generatedData = {
        name: data.name,
        description: data.description,
        level: data.level,
        lessons: data.lessons.map((lesson) => ({
          name: lesson.name,
          description: lesson.description || '',
          lessonNumber: lesson.lessonNumber,
          video: {
            title: lesson.video.title,
            description: lesson.video.description || '',
            tags: lesson.video.tags,
            drillName: lesson.video.drillName,
            drillDescription: lesson.video.drillDescription,
            drillPracticeSets: lesson.video.drillPracticeSets,
          },
          quiz: {
            title: lesson.quiz.title,
            description: lesson.quiz.description || '',
            questions: lesson.quiz.questions.map((question) => ({
              title: question.title,
              explanation: question.explanation || '',
              options: question.options.map((option) => ({
                content: option.content,
                isCorrect: option.isCorrect,
              })),
            })),
          },
        })),
      };

      await manager.getRepository(AiSubjectGeneration).save(generation);

      return new CustomApiResponse<AiSubjectGeneration>(
        HttpStatus.OK,
        'Đã cập nhật thành công',
        generation,
      );
    });
  }

  async delete(id: number): Promise<CustomApiResponse<void>> {
    return await this.datasource.transaction(async (manager) => {
      const generation = await manager
        .getRepository(AiSubjectGeneration)
        .findOne({
          where: { id },
          relations: ['requestedBy'],
        });
      if (!generation) {
        throw new BadRequestException('Không tìm thấy bản tạo AI');
      }
      if (generation.requestedBy.id !== this.request.user.id) {
        throw new ForbiddenException('Không có quyền xóa bản tạo này');
      }
      await manager.getRepository(AiSubjectGeneration).remove(generation);
      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'Đã xóa bản tạo AI thành công',
      );
    });
  }
}
