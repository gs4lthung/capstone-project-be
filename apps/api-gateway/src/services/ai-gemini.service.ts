// src/services/ai-gemini.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@app/config';
import {
  AiVideoComparisonResultSchema,
  AiSubjectGenerationSchema,
} from '@app/shared/dtos/ai-feedback/gemini-call.dto';
import { PoseLandmark } from './ai-pose.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiSubjectGeneration } from '@app/database/entities/ai-subject-generation.entity';
import { AiSubjectGenerationResponse } from '@app/shared/interfaces/ai-subject-generation.interface';
import { PickleballLevel } from '@app/shared/enums/pickleball.enum';

// Interface matching the Gemini API response schema
interface GeminiApiResponse {
  details: Array<{
    type: string;
    advanced: string;
    strengths: string[];
    weaknesses: string[];
    learnerTimestamp: number;
    coachTimestamp: number;
  }>;
  keyDifferents: Array<{
    aspect: string;
    learnerTechnique: string;
    impact: string;
  }>;
  summary: string;
  recommendationDrills: Array<{
    name: string;
    description: string;
    practiceSets: string;
  }>;
  learnerScore: number;
}

@Injectable()
export class AiGeminiService {
  private readonly logger = new Logger(AiGeminiService.name);
  private readonly apiKey: string;
  private readonly model = 'gemini-2.5-flash';
  private readonly endpoint: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(AiSubjectGeneration)
    private readonly aiSubjectGenerationRepository: Repository<AiSubjectGeneration>,
  ) {
    this.apiKey = this.configService.get('gemini').api_key as string;
    this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;

    if (!this.apiKey) {
      this.logger.warn('⚠️ GEMINI_API_KEY is not configured');
    }
  }

  async comparePoseData(
    coachPoses: PoseLandmark[][],
    coachTimestamps: number[],
    learnerPoses: PoseLandmark[][],
    learnerTimestamps: number[],
  ): Promise<GeminiApiResponse> {
    // Validate input data
    if (
      !coachPoses ||
      !learnerPoses ||
      coachPoses.length === 0 ||
      learnerPoses.length === 0
    ) {
      this.logger.warn('⚠️ Invalid pose data received');
      return this.getDefaultResponse('Dữ liệu tư thế không hợp lệ');
    }

    if (
      !coachTimestamps ||
      !learnerTimestamps ||
      coachTimestamps.length === 0 ||
      learnerTimestamps.length === 0
    ) {
      this.logger.warn('⚠️ Invalid timestamp data received');
      return this.getDefaultResponse('Dữ liệu thời gian không hợp lệ');
    }

    const prompt = `
Bạn là một huấn luyện viên pickleball AI, chuyên đưa ra phản hồi so sánh nhanh chóng, súc tích cho người dùng di động.

Nhiệm vụ: So sánh dữ liệu JSON của "Huấn luyện viên" (player1, tham chiếu) và "Học viên" (player2). Dữ liệu trả ra chỉ dành cho phân tích cho học viên và trả ra "Học viên" thay vì "Player 2". Tập trung vào việc giúp Học viên cải thiện bằng cách phân tích hình học và chuyển động giữa các điểm khớp.

YÊU CẦU QUAN TRỌNG:
- **SÚC TÍCH TỐI ĐA:** Toàn bộ phản hồi PHẢI CỰC KỲ ngắn gọn. Sử dụng các gạch đầu dòng và câu ngắn. TRÁNH các đoạn văn dài.
- **Phân tích so sánh ('comparison'):** Mỗi 'analysis', 'advantage' chỉ nên là một câu ngắn gọn. 'strengths' và 'weaknesses' là các gạch đầu dòng ngắn.
- **Khác biệt chính ('keyDifferences'):** Liệt kê 2-3 điểm khác biệt quan trọng nhất một cách ngắn gọn.
- **Tóm tắt ('summary'):** Một câu duy nhất.
- **Đề xuất & Bài tập ('recommendationsForPlayer2'):** Đề xuất phải trực tiếp. Mô tả bài tập ('drill.description') chỉ nên là các bước chính, không quá 2 câu.
- **Dấu thời gian ('timestamp'):** QUAN TRỌNG! Với mỗi giai đoạn (preparation, swingAndContact, followThrough), hãy xác định chính xác thời điểm (giây) xảy ra trong video của HLV (\`coachTimestamp\`) và Học viên (\`learnerTimestamp\`). Đây là lúc hành động diễn ra rõ nhất.
- **Điểm số:** Chấm điểm trên thang 100 điểm.

DỮ LIỆU ĐẦU VÀO:
- Dấu thời gian HLV: ${coachTimestamps.join(', ')} giây
- Dữ liệu tư thế HLV (JSON): ${JSON.stringify(coachPoses)}
- Dấu thời gian Học viên: ${learnerTimestamps.join(', ')} giây
- Dữ liệu tư thế Học viên (JSON): ${JSON.stringify(learnerPoses)}

Hãy trả lời CHỈ bằng một đối tượng JSON bằng tiếng Việt theo schema đã định nghĩa.
    `;

    try {
      if (!this.apiKey) {
        this.logger.error('❌ Gemini API key not configured');
        return this.getDefaultResponse('Dịch vụ AI chưa được cấu hình');
      }

      const response = await this.callGeminiWithRetry({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          response_schema: AiVideoComparisonResultSchema,
        },
      });

      if (!response) {
        this.logger.error('❌ Empty response from Gemini API');
        return this.getDefaultResponse('Không nhận được phản hồi từ AI');
      }

      const jsonRes = this.parseJsonResponse<GeminiApiResponse>(response);

      // Validate response structure
      if (!jsonRes || typeof jsonRes !== 'object') {
        this.logger.error('❌ Invalid response structure');
        return this.getDefaultResponse('Phản hồi AI không hợp lệ');
      }

      return {
        details: jsonRes.details || [],
        keyDifferents: jsonRes.keyDifferents || [],
        summary: jsonRes.summary || 'Không thể tạo tóm tắt',
        recommendationDrills: jsonRes.recommendationDrills || [],
        learnerScore: jsonRes.learnerScore || 50,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('❌ Gemini API call failed:', errorMessage);
      return this.getDefaultResponse(
        'AI không thể xử lý dữ liệu. Vui lòng thử lại sau.',
      );
    }
  }

  private getDefaultResponse(errorMessage: string): GeminiApiResponse {
    return {
      details: [
        {
          type: 'error',
          advanced: errorMessage,
          strengths: ['Không thể phân tích'],
          weaknesses: ['Lỗi hệ thống'],
          learnerTimestamp: 0,
          coachTimestamp: 0,
        },
      ],
      keyDifferents: [
        {
          aspect: 'Lỗi',
          learnerTechnique: 'Không khả dụng',
          impact: errorMessage,
        },
      ],
      summary: errorMessage,
      recommendationDrills: [
        {
          name: 'Thử lại sau',
          description: 'Vui lòng kiểm tra kết nối và thử lại',
          practiceSets: '0',
        },
      ],
      learnerScore: 0,
    };
  }

  private async callGeminiWithRetry(body: any, retries = 5): Promise<string> {
    const url = `${this.endpoint}?key=${this.apiKey}`;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.logger.log(`🔄 Gemini API attempt ${attempt}/${retries}...`);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          this.logger.error(
            `❌ Gemini API error (${response.status}):`,
            errorText,
          );

          // Retry on 503 (overloaded) or 429 (rate limit)
          if (
            (response.status === 503 || response.status === 429) &&
            attempt < retries
          ) {
            // Try to parse retry delay from error response
            let waitTime = attempt * 5000; // Default: exponential backoff
            try {
              const errorJson = JSON.parse(errorText);
              const retryInfo = errorJson?.error?.details?.find(
                (d: any) =>
                  d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo',
              );
              if (retryInfo?.retryDelay) {
                // Parse delay (format: "5s" or "5.9s")
                const delayMatch = retryInfo.retryDelay.match(/(\d+\.?\d*)/);
                if (delayMatch) {
                  waitTime = parseFloat(delayMatch[1]) * 1000; // Convert to milliseconds
                  // Add some buffer (20% more)
                  waitTime = waitTime * 1.2;
                }
              }
            } catch {
              // If parsing fails, use default exponential backoff
            }

            this.logger.log(
              `⏳ Rate limit exceeded. Retrying in ${(waitTime / 1000).toFixed(1)}s...`,
            );
            await this.sleep(waitTime);
            continue;
          }

          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data: any = await response.json();

        this.logger.log(`✅ Gemini API success on attempt ${attempt}`);
        return data?.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (error) {
        if (attempt < retries && error instanceof TypeError) {
          this.logger.log(`⏳ Network error, retrying in 3s...`);
          await this.sleep(3000);
          continue;
        }
        throw error;
      }
    }

    throw new Error('Max retries exceeded');
  }

  private parseJsonResponse<T>(text: string): T {
    try {
      const cleanedText = text.replace(/^```json\s*|```$/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      this.logger.error('❌ Failed to parse JSON:', error);
      throw new Error('Invalid JSON response from AI');
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate a complete subject structure with lessons and quizzes based on a user prompt
   * Example: "I want a subject for advanced backhand technique"
   */
  async generateSubjectFromPrompt(
    prompt: string,
  ): Promise<AiSubjectGenerationResponse> {
    this.logger.log(`🎯 Generating subject from prompt: "${prompt}"`);

    const systemPrompt = `
Bạn là một chuyên gia thiết kế khóa học pickleball. Nhiệm vụ của bạn là tạo ra một chủ đề (subject) hoàn chỉnh dựa trên yêu cầu của người dùng.

YÊU CẦU:
1. **Subject (Chủ đề):**
   - Tên ngắn gọn, súc tích (tối đa 100 ký tự)
   - Mô tả chi tiết về nội dung (200-500 từ)
   - Xác định level phù hợp: BEGINNER, INTERMEDIATE, hoặc ADVANCED

2. **Lessons (Bài học):**
   - Nếu người dùng CHỈ ĐỊNH số lượng bài học (ví dụ: "5 bài học", "8 lessons", "10 bài"), hãy TẠO ĐÚNG số lượng đó
   - Nếu người dùng KHÔNG chỉ định, mặc định tạo 4-6 bài học tuần tự, logic
   - Số lượng bài học tối thiểu: 3, tối đa: 10
   - Mỗi bài học có:
     + Tên rõ ràng, hấp dẫn
     + Mô tả chi tiết (100-200 từ)
     + Số thứ tự (lessonNumber) từ 1 trở đi

3. **Video (Video hướng dẫn):**
   - MỖI bài học có ĐÚNG 1 video
   - Mỗi video có:
     + title: Tiêu đề video (ngắn gọn, hấp dẫn)
     + description: Mô tả chi tiết nội dung video (100-200 từ)
     + tags: Mảng các từ khóa liên quan (3-5 tags)
     + drillName: Tên bài tập drill (nếu có)
     + drillDescription: Mô tả bài tập drill chi tiết (nếu có)
     + drillPracticeSets: Hướng dẫn số lượng luyện tập (ví dụ: "3 sets x 10 reps")
   - Lưu ý: File video thực tế sẽ được upload sau, chỉ cần tạo metadata

4. **Quiz (Trắc nghiệm):**
   - MỖI bài học có ĐÚNG 1 quiz
   - Mỗi quiz có 5 câu hỏi
   - Mỗi câu hỏi có:
     + Tiêu đề câu hỏi rõ ràng
     + Giải thích chi tiết (explanation) cho câu trả lời
     + 4 lựa chọn, trong đó có ĐÚNG 1 đáp án đúng (isCorrect: true)
   - Quiz title: "Kiểm tra [Tên bài học]"
   - Quiz description: Mô tả ngắn gọn về nội dung quiz

QUAN TRỌNG:
- Nội dung phải bằng tiếng Việt
- Phù hợp với bối cảnh pickleball
- Câu hỏi phải kiểm tra được kiến thức trong bài học
- Đáp án phải chính xác và có giải thích rõ ràng
- CHÚ Ý: Nếu người dùng yêu cầu số lượng bài học cụ thể, PHẢI tạo đúng số lượng đó (trong khoảng 3-10)

YÊU CẦU CỦA NGƯỜI DÙNG: ${prompt}

Trả về JSON theo đúng schema đã định nghĩa.
    `;

    try {
      if (!this.apiKey) {
        throw new Error('Gemini API key not configured');
      }

      // Call Gemini API
      const rawResponse = await this.callGeminiWithRetry({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          response_schema: AiSubjectGenerationSchema,
        },
      });

      if (!rawResponse) {
        throw new Error('Empty response from Gemini API');
      }

      const generatedData =
        this.parseJsonResponse<AiSubjectGenerationResponse>(rawResponse);

      // Validate generated data
      this.validateSubjectGeneration(generatedData);

      return generatedData;
    } catch (error) {
      this.logger.error('❌ Subject generation failed:', error);
      throw new Error(
        `Failed to generate subject: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Validate the generated subject structure
   */
  private validateSubjectGeneration(data: AiSubjectGenerationResponse): void {
    if (!data.name || data.name.length > 100) {
      throw new Error('Invalid subject name');
    }

    if (!data.description || data.description.length < 50) {
      throw new Error('Subject description too short');
    }

    if (!Object.values(PickleballLevel).includes(data.level)) {
      throw new Error('Invalid level');
    }

    if (!data.lessons || data.lessons.length < 1) {
      throw new Error('Subject must have at least 1 lesson');
    }

    data.lessons.forEach((lesson, index) => {
      if (!lesson.name || !lesson.description) {
        throw new Error(`Lesson ${index + 1} missing name or description`);
      }

      if (lesson.lessonNumber !== index + 1) {
        throw new Error(`Lesson ${index + 1} has incorrect lesson number`);
      }

      if (!lesson.video || !lesson.video.title || !lesson.video.description) {
        throw new Error(`Lesson ${index + 1} missing video metadata`);
      }

      if (!lesson.quiz) {
        throw new Error(`Lesson ${index + 1} missing quiz`);
      }

      if (
        !lesson.quiz.questions ||
        lesson.quiz.questions.length < 3 ||
        lesson.quiz.questions.length > 10
      ) {
        throw new Error(`Lesson ${index + 1} quiz must have 3-10 questions`);
      }

      lesson.quiz.questions.forEach((question, qIndex) => {
        if (!question.title || !question.explanation) {
          throw new Error(
            `Lesson ${index + 1}, Question ${qIndex + 1} missing title or explanation`,
          );
        }

        if (!question.options || question.options.length !== 4) {
          throw new Error(
            `Lesson ${index + 1}, Question ${qIndex + 1} must have exactly 4 options`,
          );
        }

        const correctCount = question.options.filter(
          (opt) => opt.isCorrect,
        ).length;
        if (correctCount !== 1) {
          throw new Error(
            `Lesson ${index + 1}, Question ${qIndex + 1} must have exactly 1 correct answer`,
          );
        }
      });
    });
  }
}
