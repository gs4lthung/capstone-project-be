export interface AiLearnerProgressAnalysisResponse {
  title: string;
  overallSummary: string;
  progressPercentage: number;
  strengthsIdentified: string[];
  areasForImprovement: string[];
  quizPerformanceAnalysis: {
    averageScore: number;
    summary: string;
    topicsMastered: string[];
    topicsNeedingReview: string[];
  };
  videoPerformanceAnalysis: {
    averageScore: number;
    summary: string;
    techniqueStrengths: string[];
    techniqueWeaknesses: string[];
  };
  recommendationsForNextSession: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    focusAreas: string[];
  }>;
  practiceDrills: Array<{
    name: string;
    description: string;
    targetArea: string;
    sets: string;
  }>;
  motivationalMessage: string;
}
