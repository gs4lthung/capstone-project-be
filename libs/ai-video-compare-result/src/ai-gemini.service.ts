// src/services/ai-gemini.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@app/config';
import { PoseLandmark } from './ai-pose.service';

export interface VideoComparisonResult {
  comparison: {
    preparation: {
      player1: { analysis: string; timestamp: number };
      player2: {
        analysis: string;
        strengths: string[];
        weaknesses: string[];
        timestamp: number;
      };
      advantage: string;
    };
    swingAndContact: {
      player1: { analysis: string; timestamp: number };
      player2: {
        analysis: string;
        strengths: string[];
        weaknesses: string[];
        timestamp: number;
      };
      advantage: string;
    };
    followThrough: {
      player1: { analysis: string; timestamp: number };
      player2: {
        analysis: string;
        strengths: string[];
        weaknesses: string[];
        timestamp: number;
      };
      advantage: string;
    };
  };
  keyDifferences: Array<{
    aspect: string;
    player1_technique: string;
    player2_technique: string;
    impact: string;
  }>;
  summary: string;
  recommendationsForPlayer2: Array<{
    recommendation: string;
    drill: {
      title: string;
      description: string;
      practice_sets: string;
    };
  }>;
  overallScoreForPlayer2: number;
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
  ): Promise<VideoComparisonResult> {
    const prompt = `
Bạn là một huấn luyện viên pickleball AI, chuyên đưa ra phản hồi so sánh nhanh chóng, súc tích cho người dùng di động.

Nhiệm vụ: So sánh dữ liệu JSON của "Huấn luyện viên" (player1, tham chiếu) và "Học viên" (player2). Tập trung vào việc giúp Học viên cải thiện bằng cách phân tích hình học và chuyển động giữa các điểm khớp.

YÊU CẦU QUAN TRỌNG:
- **SÚC TÍCH TỐI ĐA:** Toàn bộ phản hồi PHẢI CỰC KỲ ngắn gọn. Sử dụng các gạch đầu dòng và câu ngắn. TRÁNH các đoạn văn dài.
- **Phân tích so sánh ('comparison'):** Mỗi 'analysis', 'advantage' chỉ nên là một câu ngắn gọn. 'strengths' và 'weaknesses' là các gạch đầu dòng ngắn.
- **Khác biệt chính ('keyDifferences'):** Liệt kê 2-3 điểm khác biệt quan trọng nhất một cách ngắn gọn.
- **Tóm tắt ('summary'):** Một câu duy nhất.
- **Đề xuất & Bài tập ('recommendationsForPlayer2'):** Đề xuất phải trực tiếp. Mô tả bài tập ('drill.description') chỉ nên là các bước chính, không quá 2 câu.
- **Dấu thời gian:** Luôn bao gồm dấu thời gian chính xác cho mỗi giai đoạn, được cung cấp dưới đây.
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
          response_schema: this.getComparisonSchema(),
        },
      });

      return this.parseJsonResponse<VideoComparisonResult>(response);
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
        const text =
          data?.candidates?.[0]?.content?.parts
            ?.map((p: any) => p.text ?? '')
            .join('') ?? '';

        if (!text) {
          throw new Error('Empty response from Gemini');
        }

        this.logger.log(`✅ Gemini API success on attempt ${attempt}`);
        return text;
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

  private getComparisonSchema() {
    return {
      type: 'object',
      properties: {
        comparison: {
          type: 'object',
          properties: {
            preparation: {
              type: 'object',
              properties: {
                player1: {
                  type: 'object',
                  properties: {
                    analysis: { type: 'string' },
                    timestamp: { type: 'number' },
                  },
                  required: ['analysis', 'timestamp'],
                },
                player2: {
                  type: 'object',
                  properties: {
                    analysis: { type: 'string' },
                    strengths: { type: 'array', items: { type: 'string' } },
                    weaknesses: { type: 'array', items: { type: 'string' } },
                    timestamp: { type: 'number' },
                  },
                  required: [
                    'analysis',
                    'strengths',
                    'weaknesses',
                    'timestamp',
                  ],
                },
                advantage: { type: 'string' },
              },
              required: ['player1', 'player2', 'advantage'],
            },
            swingAndContact: {
              type: 'object',
              properties: {
                player1: {
                  type: 'object',
                  properties: {
                    analysis: { type: 'string' },
                    timestamp: { type: 'number' },
                  },
                  required: ['analysis', 'timestamp'],
                },
                player2: {
                  type: 'object',
                  properties: {
                    analysis: { type: 'string' },
                    strengths: { type: 'array', items: { type: 'string' } },
                    weaknesses: { type: 'array', items: { type: 'string' } },
                    timestamp: { type: 'number' },
                  },
                  required: [
                    'analysis',
                    'strengths',
                    'weaknesses',
                    'timestamp',
                  ],
                },
                advantage: { type: 'string' },
              },
              required: ['player1', 'player2', 'advantage'],
            },
            followThrough: {
              type: 'object',
              properties: {
                player1: {
                  type: 'object',
                  properties: {
                    analysis: { type: 'string' },
                    timestamp: { type: 'number' },
                  },
                  required: ['analysis', 'timestamp'],
                },
                player2: {
                  type: 'object',
                  properties: {
                    analysis: { type: 'string' },
                    strengths: { type: 'array', items: { type: 'string' } },
                    weaknesses: { type: 'array', items: { type: 'string' } },
                    timestamp: { type: 'number' },
                  },
                  required: [
                    'analysis',
                    'strengths',
                    'weaknesses',
                    'timestamp',
                  ],
                },
                advantage: { type: 'string' },
              },
              required: ['player1', 'player2', 'advantage'],
            },
          },
          required: ['preparation', 'swingAndContact', 'followThrough'],
        },
        keyDifferences: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              aspect: { type: 'string' },
              player1_technique: { type: 'string' },
              player2_technique: { type: 'string' },
              impact: { type: 'string' },
            },
            required: [
              'aspect',
              'player1_technique',
              'player2_technique',
              'impact',
            ],
          },
        },
        summary: { type: 'string' },
        recommendationsForPlayer2: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              recommendation: { type: 'string' },
              drill: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  practice_sets: { type: 'string' },
                },
                required: ['title', 'description', 'practice_sets'],
              },
            },
            required: ['recommendation', 'drill'],
          },
        },
        overallScoreForPlayer2: { type: 'number' },
      },
      required: [
        'comparison',
        'keyDifferences',
        'summary',
        'recommendationsForPlayer2',
        'overallScoreForPlayer2',
      ],
    };
  }
}
