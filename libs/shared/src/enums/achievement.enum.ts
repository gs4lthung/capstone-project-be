/**
 * Achievement Event Names Enum
 *
 * Định nghĩa tất cả các event names có thể được sử dụng trong achievements
 */
export enum AchievementEventName {
  // Lesson events
  LESSON_COMPLETED = 'LESSON_COMPLETED',

  // Session events
  SESSION_ATTENDED = 'SESSION_ATTENDED',

  // Video events
  VIDEO_WATCHED = 'VIDEO_WATCHED',

  // Course events
  COURSE_COMPLETED = 'COURSE_COMPLETED',

  // Quiz events
  QUIZ_COMPLETED = 'QUIZ_COMPLETED',

  // Login events
  DAILY_LOGIN = 'DAILY_LOGIN',

  // Daily activity events
  DAILY_LESSON = 'DAILY_LESSON',
  DAILY_QUIZ = 'DAILY_QUIZ',
  DAILY_VIDEO = 'DAILY_VIDEO',

  // Weekly events
  WEEKLY_SESSION = 'WEEKLY_SESSION',

  // Feedback events
  FEEDBACK_RECEIVED = 'FEEDBACK_RECEIVED',
}

/**
 * Get all achievement event names as an array
 * @returns Array of event name strings
 */
export function getAllAchievementEventNames(): string[] {
  return Object.values(AchievementEventName);
}
