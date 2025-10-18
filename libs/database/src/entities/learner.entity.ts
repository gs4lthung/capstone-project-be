import { PickleballLevel } from '@app/shared/enums/pickleball.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { Feedback } from './feedback.entity';
import { Note } from './note.entity';
import { Attendance } from './attendance.entity';
import { QuizAttempt } from './quiz_attempt.entity';
import { LearnerProgress } from './learner-progress.entity';
import { AchievementProgress } from './achievement-progress.entity';
import { LearnerAchievement } from './learner-achievement.entity';
import { LearnerVideo } from './learner-video.entity';
import { LearnerSkillAssessment } from './learner-skill-assessment.entity';

@Entity('learners')
export class Learner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'skill_level',
    type: 'enum',
    enum: PickleballLevel,
    default: PickleballLevel.BEGINNER,
  })
  skillLevel: PickleballLevel;

  @Column({
    name: 'learning_goal',
    type: 'enum',
    enum: PickleballLevel,
    default: PickleballLevel.BEGINNER,
  })
  learningGoal: PickleballLevel;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.learner)
  enrollments: Enrollment[];

  @OneToMany(() => Feedback, (feedback) => feedback.learner)
  feedbacks: Feedback[];

  @OneToMany(() => Note, (note) => note.learner)
  notes: Note[];

  @OneToMany(() => Attendance, (attendance) => attendance.learner)
  attendances: Attendance[];

  @OneToMany(() => QuizAttempt, (quizAttempt) => quizAttempt.attemptedBy)
  quizAttempts: QuizAttempt[];

  @OneToMany(
    () => LearnerProgress,
    (learnerProgress) => learnerProgress.learner,
  )
  learnerProgresses: LearnerProgress[];

  @OneToMany(
    () => AchievementProgress,
    (achievementProgress) => achievementProgress.learner,
  )
  achievementProgresses: AchievementProgress[];

  @OneToMany(() => LearnerAchievement, (achievement) => achievement.achievement)
  achievements: LearnerAchievement[];

  @OneToMany(() => LearnerVideo, (learnerVideo) => learnerVideo.learner)
  learnerVideos: LearnerVideo[];

  @OneToMany(
    () => LearnerSkillAssessment,
    (learnerSkillAssessment) => learnerSkillAssessment.learner,
  )
  learnerSkillAssessments: LearnerSkillAssessment[];
}
