import { PickleballLevel } from '../enums/pickleball.enum';

export interface AiSubjectGenerationResponse {
  name: string;
  description: string;
  level: PickleballLevel;
  lessons: Array<{
    name: string;
    description: string;
    lessonNumber: number;
    video: {
      title: string;
      description: string;
      tags?: string[];
      drillName?: string;
      drillDescription?: string;
      drillPracticeSets?: string;
    };
    quiz: {
      title: string;
      description: string;
      questions: Array<{
        title: string;
        explanation: string;
        options: Array<{
          content: string;
          isCorrect: boolean;
        }>;
      }>;
    };
  }>;
}
