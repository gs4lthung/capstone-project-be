// src/services/ai-gemini.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@app/config';
import { PoseLandmark } from './ai-pose.service';
import { AiVideoComparisonResultSchema } from '@app/shared/dtos/ai-feedback/gemini-call.dto';
import { AiVideoComparisonResult } from '@app/database/entities/ai-video-comparison-result.entity';

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

  constructor(private configService: ConfigService) {
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

      const jsonRes = this.parseJsonResponse<GeminiApiResponse>(response);

      return {
        details: jsonRes.details,
        keyDifferents: jsonRes.keyDifferents,
        summary: jsonRes.summary,
        recommendationDrills: jsonRes.recommendationDrills,
        learnerScore: jsonRes.learnerScore,
      };
    } catch (error) {
      this.logger.error('❌ Gemini API call failed:', error);
      throw new Error('AI không thể xử lý dữ liệu. Vui lòng thử lại sau.');
    }
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
}
