# Feature: Learner Progress

## Controllers

| Class | No | Method | Description |
|-------|----|--------------------|-------------|

### LearnerProgressController

| No | Method | Description |
|----|--------|-------------|
| 1 | findAll(pagination, sort, filter) | Get all learner progresses with pagination, sorting, filtering |
| 2 | getProgressForCourse(courseStatus) | Get learner progresses for coach's courses filtered by course status |
| 3 | getLearnerProgressDetails(userId, courseId) | Get detailed learner progress for specific user and course with all relations |
| 4 | getAiLearnerProgressAnalysis(learnerProgressId) | Generate AI-powered analysis and recommendations for learner progress |

## Services

### LearnerProgressService

| No | Method | Description |
|----|--------|-------------|
| 1 | findAll(findOptions) | Query all learner progresses with pagination, sorting, filtering |
| 2 | getProgressForCourse(courseStatus) | Transaction: query progresses filtered by course status and coach ownership |
| 3 | getLearnerProgressDetails(userId, courseId) | Transaction: fetch detailed progress with course, sessions, videos, quizzes, attempts |
| 4 | generateAiProgressAnalysis(learnerProgressId) | Transaction: aggregate progress data, call AI service, save analysis, update metrics |

### AiGeminiService

| No | Method | Description |
|----|--------|-------------|
| 1 | generateProgressAnalysis(progressData) | Call Gemini API to analyze learner progress and generate personalized recommendations |

## Guards

### AuthGuard
Validates JWT token from request headers for all learner progress endpoints.

## Entities

### LearnerProgress
Tracks learner progress in a course. Properties: id, sessionsCompleted, totalSessions, avgAiAnalysisScore, avgQuizScore, canGenerateAIAnalysis, status (IN_PROGRESS/COMPLETED/DROPPED), user (User), course (Course), aiLearnerProgressAnalyses (AiLearnerProgressAnalysis[]), createdAt, updatedAt.

### Course
Represents a course. Properties: id, name, description, status, sessions (Session[]), learnerProgresses (LearnerProgress[]).

### User
Represents learner or coach. Properties: id, fullName, email, role, learnerProgresses (LearnerProgress[]).

### Session
Represents a session in course. Properties: id, sessionNumber, status, course (Course), quizAttempts (QuizAttempt[]), learnerVideos (LearnerVideo[]).

### QuizAttempt
Records learner's quiz attempt. Properties: id, session (Session), attemptedBy (User), score, passed, learnerAnswers (LearnerAnswer[]).

### LearnerVideo
Learner's uploaded video for session. Properties: id, session (Session), user (User), aiVideoComparisonResults (AiVideoComparisonResult[]).

### AiVideoComparisonResult
AI comparison of learner video vs coach video. Properties: id, learnerVideo (LearnerVideo), score, feedback.

### AiLearnerProgressAnalysis
Stores AI-generated progress analysis. Properties: id, learnerProgress (LearnerProgress), analysis (JSON), recommendations (JSON), generatedAt.

## Scope Rules

- **View Access**: All authenticated users can view learner progress data
- **Coach Filter**: getProgressForCourse filters by coach ownership (course.createdBy == currentUser)
- **Detailed Progress**: Includes full course structure with sessions, videos, quizzes, and attempts
- **AI Analysis Generation**: Requires sufficient completed sessions data
- **Progress Metrics**: Automatically calculated from quiz attempts and video analysis scores
- **Status Tracking**: Progress status updates based on completion rate (IN_PROGRESS/COMPLETED/DROPPED)
- **AI Integration**: Uses Gemini API to generate personalized analysis and recommendations
- **Data Aggregation**: Combines quiz scores, video analysis, attendance, and session completion
- **Recommendations**: AI provides actionable recommendations based on learner's strengths and weaknesses
- **Analysis History**: Multiple AI analyses can be generated over time, tracked in aiLearnerProgressAnalyses
- **Score Averaging**: avgQuizScore and avgAiAnalysisScore updated after each analysis generation
- **Analysis Flag**: canGenerateAIAnalysis indicates if learner has sufficient data for AI analysis
