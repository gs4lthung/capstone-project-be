# Manage Session Quiz Feature Diagrams

## Overview

This feature allows coaches to view and update quizzes for sessions. Session quizzes are auto-generated from the lesson quiz when a session is created, and coaches can only update them (not create or delete).

## Diagrams Included

### 1. Class Diagram (`class-diagram.puml`)

Illustrates the architecture for managing session quizzes:

#### Layers

1. **Presentation Layer**:
   - `QuizFormPanel`: Form for editing quizzes with questions and options
   - `QuizViewPanel`: Display quiz details with questions and options

2. **Controller Layer**:
   - `QuizController`: HTTP endpoints for quiz view and update operations

3. **Service Layer**:
   - `QuizService`: Business logic for quiz management, validation, and ownership verification

4. **Entity Layer**:
   - `Quiz`: Quiz metadata (title, description, totalQuestions)
   - `Question`: Questions within a quiz (title, explanation)
   - `QuestionOption`: Answer options for questions (content, isCorrect)
   - `Session`: Parent entity for quizzes
   - `Course`: Owns sessions (for ownership verification via coach)
   - `User`: Quiz creator and course coach

5. **DTOs**:
   - `UpdateQuizDto`, `UpdateQuestionDto`, `UpdateQuestionOptionDto`

#### Key Relationships

- Quiz → Session (one-to-one, each session has at most one quiz)
- Quiz → Question (one-to-many, cascade insert)
- Question → QuestionOption (one-to-many, cascade insert)
- Quiz → User (many-to-one, createdBy)
- Session → Course (many-to-one, for ownership chain)
- Course → User (many-to-one, coach)

### 2. Sequence Diagram: View Operation (`sequence-view.puml`)

Shows how coaches view a session's quiz:

1. Coach views session
2. System queries quiz by session ID
3. Loads quiz with all questions and options
4. Displays quiz details to coach

### 3. Sequence Diagram: Update Operation (`sequence-update.puml`)

Shows how coaches update a session's quiz:

#### Update Quiz Flow

1. Coach views session with quiz
2. Clicks "Edit Quiz"
3. Loads existing quiz data into form
4. Coach modifies quiz details, questions, or options
5. System validates ownership and data integrity
6. Uses complete replacement strategy:
   - Removes old questions (cascade to options)
   - Inserts new questions with options
   - Updates quiz metadata
7. Returns success response

## Important Design Notes

### Quiz Creation

- Session quizzes are **auto-generated** when a session is created
- They are copied from the lesson's quiz
- Coaches **cannot manually create** quizzes for sessions
- Coaches can only **view** and **update** existing session quizzes

### Ownership Verification

- Quizzes inherit ownership from their session's course coach
- Only the course coach can update the session quiz
- Ownership check: `session.course.coach.id === currentUser.id`

### No Delete/Restore

- Session quizzes **cannot be deleted** or restored
- They exist as long as the session exists
- Soft delete functionality is not available for session quizzes

### Cascade Operations

- Updating quiz cascades to questions and options (single transaction)
- Deleting questions cascades to options

### Validation Rules

For each quiz:
- **Title**: Required (max 100 characters)
- **Description**: Optional (text)
- **Questions**: At least 1 required

For each question:
- **Title**: Required (2-200 characters)
- **Explanation**: Optional (text)
- **Options**: At least 2 required

For each option:
- **Content**: Required (1-1000 characters)
- **Is Correct**: Boolean flag
- **At least 1 option per question must be marked correct**

### Update Strategy

Uses complete replacement approach:

1. Delete all existing questions (cascade to options)
2. Insert new questions with options
3. Update quiz metadata
4. All within a transaction for data integrity

## Entity Constraints

From actual codebase verification:

### Quiz Entity

```typescript
- id: number (PK)
- title: string (varchar 100)
- description?: string (text, nullable)
- totalQuestions: number (auto-calculated)
- questions: Question[] (eager load, cascade insert)
- createdBy: User (eager load)
- deletedAt?: Date (soft delete)
- lesson: Lesson (one-to-one, nullable)
- session: Session (one-to-one, nullable)
- CHECK: (lesson OR session, not both)
```

### Question Entity

```typescript
- id: number (PK)
- title: string (varchar 200, min 2 chars)
- explanation?: string (text, nullable)
- quiz: Quiz (cascade delete)
- options: QuestionOption[] (eager load, cascade insert)
- learnerAnswers: LearnerAnswer[]
- createdAt: Date
```

### QuestionOption Entity

```typescript
- id: number (PK)
- content: string (text, 1-1000 chars)
- isCorrect: boolean (default false)
- question: Question (cascade delete)
- learnerAnswers: LearnerAnswer[]
- createdAt: Date
```

### Session Entity

```typescript
- id: number (PK)
- sessionNumber: number
- startTime: Date
- endTime: Date
- status: SessionStatus
- quiz: Quiz (one-to-one)
- course: Course
- lesson: Lesson
```

## API Endpoints

Suggested endpoints based on diagram flows:

```http
GET    /sessions/:sessionId/quiz       - Get quiz by session ID
PUT    /quizzes/:id                    - Update quiz
```

## Security

- All endpoints protected by `AuthGuard` (authentication required)
- All endpoints protected by `RoleGuard` (COACH role required)
- Ownership verification on update operations
- Only course coach can update quizzes for their sessions

## Transaction Management

Critical operations use database transactions:

- Quiz update (delete old + insert new)
- Ensures data consistency and rollback on errors

## Diagram Guidelines

### Sequence Diagram Rules

1. **Use Specific Instance Names (NOT generic class names)**:
   - ✅ `QuizController`, `QuizService`, `QuizRepository`, `SessionRepository`, `PostgreSQL`
   - ❌ `Controller`, `Service`, `Database`
   - ✅ `Web Browser` (not `Client`)

2. **Include Repository Layer**:
   - Always show repository layer between service and database
   - Show explicit repository method calls with parameters
   - Example: `sessionRepo: findOne(id, relations: ['course.coach'])`
   - Show explicit SQL operations where appropriate
   - Example: `UPDATE quizzes SET ... WHERE id = ?`

3. **No Note Blocks**:
   - ❌ Do NOT use `note right of`, `note left of`, or `note over` blocks
   - Keep diagrams clean and focused on the flow
   - Document explanations in this instruction file instead

4. **Transaction Operations**:
   - Show explicit transaction boundaries: `Start transaction`, `Commit transaction`
   - Show each repository operation separately within transactions
   - Example: Delete questions, Insert questions, Update quiz metadata

5. **Ownership Verification**:
   - Show as service method call, not separate note
   - Example: `service -> service: Verify ownership (session.course.coach.id == currentUser)`

6. **Relations Parameter**:
   - Always include relations parameter in findOne/find calls
   - Example: `findOne(id, relations: ['session.course.coach', 'questions.options'])`

## Key Differences from Lesson Quiz

| Feature | Lesson Quiz | Session Quiz |
|---------|-------------|--------------|
| Create | ✅ Manual by coach | ❌ Auto-generated from lesson |
| View | ✅ Yes | ✅ Yes |
| Update | ✅ Yes | ✅ Yes |
| Delete | ✅ Soft delete | ❌ Not allowed |
| Restore | ✅ Yes | ❌ Not allowed |
| Ownership | Subject creator | Course coach |
| Relationship | One-to-one with Lesson | One-to-one with Session |
