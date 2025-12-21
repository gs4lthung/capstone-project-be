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
 * Mapping event names to Vietnamese labels
 */
export const AchievementEventLabels: Record<AchievementEventName, string> = {
  [AchievementEventName.LESSON_COMPLETED]: 'Hoàn thành bài học',
  [AchievementEventName.SESSION_ATTENDED]: 'Tham gia buổi học',
  [AchievementEventName.VIDEO_WATCHED]: 'Xem video bài giảng',
  [AchievementEventName.COURSE_COMPLETED]: 'Hoàn thành khóa học',
  [AchievementEventName.QUIZ_COMPLETED]: 'Hoàn thành quiz',
  [AchievementEventName.DAILY_LOGIN]: 'Đăng nhập hàng ngày',
  [AchievementEventName.DAILY_LESSON]: 'Hoàn thành bài học hàng ngày',
  [AchievementEventName.DAILY_QUIZ]: 'Làm quiz hàng ngày',
  [AchievementEventName.DAILY_VIDEO]: 'Xem video hàng ngày',
  [AchievementEventName.WEEKLY_SESSION]: 'Tham gia session hàng tuần',
  [AchievementEventName.FEEDBACK_RECEIVED]: 'Nhận phản hồi',
};

/**
 * Event name with label interface
 */
export interface AchievementEventNameOption {
  value: string;
  label: string;
}

/**
 * Get all achievement event names with labels
 * @returns Array of event name objects with value and label
 */
export function getAllAchievementEventNames(): AchievementEventNameOption[] {
  return Object.values(AchievementEventName).map((value) => ({
    value,
    label: AchievementEventLabels[value],
  }));
}
