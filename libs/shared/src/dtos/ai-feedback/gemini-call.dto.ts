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
