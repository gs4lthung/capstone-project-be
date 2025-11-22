import { Type, Static } from '@sinclair/typebox';

// Enum for detail 'type'
export enum AiVideoComparisonDetailsType {
  PREPARATION = 'PREPARATION',
  SWING_AND_CONTACT = 'SWING_AND_CONTACT',
  FOLLOW_THROUGH = 'FOLLOW_THROUGH',
}

// Detail schema
export const AiVideoComparisonDetailsSchema = Type.Object({
  type: Type.Enum(AiVideoComparisonDetailsType),
  advanced: Type.String(),
  strengths: Type.Optional(Type.Array(Type.String())),
  weaknesses: Type.Optional(Type.Array(Type.String())),
});

// Recommendation Drill schema
export const AiVideoComparisonRecommendationDrillSchema = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 50 }),
  description: Type.Optional(Type.String()),
  practiceSets: Type.Optional(Type.String()),
});

// Key Different schema
export const AiVideoComparisonKeyDifferentSchema = Type.Object({
  aspect: Type.String({ minLength: 2, maxLength: 50 }),
  impact: Type.String(),
  learnerTechnique: Type.String(),
});

// Main Result schema
export const AiVideoComparisonResultSchema = Type.Object({
  id: Type.Number(),
  summary: Type.Optional(Type.String()),
  learnerScore: Type.Optional(Type.Integer({ minimum: 0, maximum: 100 })),
  keyDifferents: Type.Optional(Type.Array(AiVideoComparisonKeyDifferentSchema)),
  details: Type.Optional(Type.Array(AiVideoComparisonDetailsSchema)),
  recommendationDrills: Type.Optional(
    Type.Array(AiVideoComparisonRecommendationDrillSchema),
  ),
});

// Export combined schema for Gemini validation
export const AiComparisonSchema = Type.Object({
  result: AiVideoComparisonResultSchema,
});

// For TypeScript static typing
export type AiComparison = Static<typeof AiComparisonSchema>;
