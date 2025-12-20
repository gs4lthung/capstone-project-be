# Feature: Manage Lesson Quiz

## Controllers

| Class | No | Method | Description |
|-------|----|--------------------|-------------|

### QuizController

| No | Method | Description |
|----|--------|-------------|
| 1 | getQuizByLesson(id) | Get all quizzes by lesson ID |
| 2 | getQuizBySession(id) | Get all quizzes by session ID |
| 3 | getQuizAttemptsByQuiz(id) | Get all quiz attempts for a quiz (COACH/ADMIN) |
| 4 | getQuizAttemptsByQuizAndUser(id, userId) | Get quiz attempts by quiz ID and user ID |
| 5 | createLessonQuiz(id, data) | Create new lesson quiz with questions (COACH only) |
| 6 | createSessionQuiz(id, data) | Create new session quiz with questions (COACH only, session quiz only) |
| 7 | addQuestionsToQuiz(id, data) | Add new question to existing quiz (COACH only, lesson quiz only) |
| 8 | update(id, data) | Update quiz properties (COACH only, lesson quiz only) |
| 9 | updateQuestionInQuiz(id, questionId, data) | Update question in quiz (COACH only, lesson quiz only) |
| 10 | delete(id) | Soft delete quiz by ID (COACH only, lesson quiz only) |
| 11 | deleteQuestionFromQuiz(questionId) | Delete question from quiz (COACH only, lesson quiz only) |
| 12 | restore(id) | Restore soft-deleted quiz (COACH only, lesson quiz only) |
| 13 | learnerAttemptQuiz(id, data) | Learner attempts quiz and submits answers (LEARNER only) |

## Services

### QuizService

| No | Method | Description |
|----|--------|-------------|
| 1 | getQuizByLesson(lessonId) | Query quizzes by lesson ID with questions/options |
| 2 | getQuizBySession(sessionId) | Query quizzes by session ID with questions/options |
| 3 | findQuizAttempts(quizId) | Find all attempts for a quiz |
| 4 | findQuizAttemptsByUser(quizId, userId) | Find quiz attempts by specific user |
| 5 | createLessonQuiz(lessonId, data) | Transaction: verify lesson ownership, create quiz with questions and options |
| 6 | createSessionQuiz(sessionId, data) | Transaction: verify session ownership, create quiz with questions and options (session quiz only) |
| 7 | createQuestion(quizId, data) | Transaction: verify quiz ownership, add question with options, validate at least one correct answer (lesson quiz only) |
| 8 | update(quizId, data) | Transaction: verify ownership, update quiz properties and questions (lesson quiz only) |
| 9 | updateQuestion(quizId, questionId, data) | Transaction: verify ownership, update question and options, validate correct answer exists (lesson quiz only) |
| 10 | delete(quizId) | Transaction: verify ownership, soft delete quiz (set deletedAt) (lesson quiz only) |
| 11 | deleteQuestion(questionId) | Transaction: verify ownership, delete question and cascade options (lesson quiz only) |
| 12 | restore(quizId) | Transaction: verify ownership, restore quiz (clear deletedAt) (lesson quiz only) |
| 13 | learnerAttemptQuiz(quizId, data) | Transaction: create quiz attempt, calculate score, update learner progress |

## Guards

### AuthGuard
Validates JWT token from request headers for all quiz endpoints.

### RoleGuard
Checks user role (COACH for CRUD operations, LEARNER for attempts) based on endpoint requirements.

## Entities

### Quiz
Represents a quiz for a lesson or session. Properties: id, title, description, passingScore, timeLimit, questions (Question[]), lesson (Lesson), session (Session), attempts (QuizAttempt[]), createdBy (User), createdAt, updatedAt, deletedAt.

### Question
Represents a question in a quiz. Properties: id, questionText, questionType (MULTIPLE_CHOICE/TRUE_FALSE/FILL_BLANK), order, points, options (QuestionOption[]), quiz (Quiz).

### QuestionOption
Represents an answer option for a question. Properties: id, optionText, isCorrect, order, question (Question).

### QuizAttempt
Represents a learner's attempt at a quiz. Properties: id, quiz (Quiz), learner (User), score, answers (JSON), passed, attemptedAt, completedAt.

### Lesson
Represents a lesson with quiz. Properties: id, name, lessonNumber, quiz (Quiz), subject.

### Session
Represents a session with quiz. Properties: id, schedule, quiz (Quiz).

### User
Represents coach or learner. Properties: id, fullName, role.

## DTOs

### CreateQuizDto
Input for creating quiz. Fields: title (string), description (string), passingScore (number), timeLimit (number), questions (CreateQuestionDto[]).

### CreateQuestionDto
Input for creating question. Fields: questionText (string), questionType (enum), order (number), points (number), options (CreateQuestionOptionDto[]).

### UpdateQuizDto
Input for updating quiz. All fields optional: title?, description?, passingScore?, timeLimit?, questions (UpdateQuestionDto[])?

### LearnerAttemptQuizDto
    .

## Scope Rules

- **Ownership Validation**: All operations verify that lesson/session creator is current user
- **Session Quiz Restrictions**: Session quizzes can only be created (passing sessionId), cannot be updated or deleted
- **Lesson Quiz Operations**: Lesson quizzes support full CRUD (create, update, delete, restore) operations
- **Question Validation**: Each question must have at least one correct answer option
- **Quiz Validation**: Quiz must have at least one question
- **Attempt Rules**: Learners can attempt quiz multiple times, each attempt tracked separately
- **Scoring**: Automatic score calculation based on correct answers and question points
- **Passing Score**: Quiz attempts marked as passed/failed based on passingScore threshold
- **Soft Delete**: Only lesson quizzes are soft deleted with deletedAt timestamp, can be restored
- **Relations**: Quizzes can belong to either Lesson or Session (not both)
- **Cascade Delete**: Deleting lesson quiz cascades to questions and options
