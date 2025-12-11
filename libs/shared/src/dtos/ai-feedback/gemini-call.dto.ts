// Enum for detail 'type'
export enum AiVideoComparisonDetailsType {
  PREPARATION = 'PREPARATION',
  SWING_AND_CONTACT = 'SWING_AND_CONTACT',
  FOLLOW_THROUGH = 'FOLLOW_THROUGH',
}

// Main Result schema (Plain JSON Schema Object matching Entity)
export const AiVideoComparisonResultSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    learnerScore: { type: 'number' },
    keyDifferents: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          aspect: { type: 'string' },
          impact: { type: 'string' },
          learnerTechnique: { type: 'string' },
        },
        required: ['aspect', 'impact', 'learnerTechnique'],
      },
    },
    details: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['PREPARATION', 'SWING_AND_CONTACT', 'FOLLOW_THROUGH'],
          },
          advanced: { type: 'string' },
          strengths: { type: 'array', items: { type: 'string' } },
          weaknesses: { type: 'array', items: { type: 'string' } },
          learnerTimestamp: { type: 'number' },
          coachTimestamp: { type: 'number' },
        },
        required: [
          'type',
          'advanced',
          'strengths',
          'weaknesses',
          'learnerTimestamp',
          'coachTimestamp',
        ],
      },
    },
    recommendationDrills: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          practiceSets: { type: 'string' },
        },
        required: ['name', 'description', 'practiceSets'],
      },
    },
  },
  required: [
    'summary',
    'learnerScore',
    'keyDifferents',
    'details',
    'recommendationDrills',
  ],
};

// Schema for AI Subject Generation
export const AiSubjectGenerationSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    level: {
      type: 'string',
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
    },
    lessons: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          lessonNumber: { type: 'number' },
          video: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              drillName: { type: 'string' },
              drillDescription: { type: 'string' },
              drillPracticeSets: { type: 'string' },
            },
            required: ['title', 'description'],
          },
          quiz: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    explanation: { type: 'string' },
                    options: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          content: { type: 'string' },
                          isCorrect: { type: 'boolean' },
                        },
                        required: ['content', 'isCorrect'],
                      },
                    },
                  },
                  required: ['title', 'explanation', 'options'],
                },
              },
            },
            required: ['title', 'description', 'questions'],
          },
        },
        required: ['name', 'description', 'lessonNumber', 'video', 'quiz'],
      },
    },
  },
  required: ['name', 'description', 'level', 'lessons'],
};

// Schema for AI Learner Progress Analysis
export const AiLearnerProgressAnalysisSchema = {
  type: 'object',
  properties: {
    overallSummary: { type: 'string' },
    progressPercentage: { type: 'number' },
    strengthsIdentified: {
      type: 'array',
      items: { type: 'string' },
    },
    areasForImprovement: {
      type: 'array',
      items: { type: 'string' },
    },
    quizPerformanceAnalysis: {
      type: 'object',
      properties: {
        averageScore: { type: 'number' },
        summary: { type: 'string' },
        topicsMastered: {
          type: 'array',
          items: { type: 'string' },
        },
        topicsNeedingReview: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: [
        'averageScore',
        'summary',
        'topicsMastered',
        'topicsNeedingReview',
      ],
    },
    videoPerformanceAnalysis: {
      type: 'object',
      properties: {
        averageScore: { type: 'number' },
        summary: { type: 'string' },
        techniqueStrengths: {
          type: 'array',
          items: { type: 'string' },
        },
        techniqueWeaknesses: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: [
        'averageScore',
        'summary',
        'techniqueStrengths',
        'techniqueWeaknesses',
      ],
    },
    recommendationsForNextSession: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          priority: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
          title: { type: 'string' },
          description: { type: 'string' },
          focusAreas: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['priority', 'title', 'description', 'focusAreas'],
      },
    },
    practiceDrills: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          targetArea: { type: 'string' },
          sets: { type: 'string' },
        },
        required: ['name', 'description', 'targetArea', 'sets'],
      },
    },
    motivationalMessage: { type: 'string' },
  },
  required: [
    'overallSummary',
    'progressPercentage',
    'strengthsIdentified',
    'areasForImprovement',
    'quizPerformanceAnalysis',
    'videoPerformanceAnalysis',
    'recommendationsForNextSession',
    'practiceDrills',
    'motivationalMessage',
  ],
};
