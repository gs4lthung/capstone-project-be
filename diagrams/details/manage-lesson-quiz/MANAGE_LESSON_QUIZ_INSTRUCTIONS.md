# Manage Lesson Quiz Feature Diagrams

## Overview

This feature allows coaches to create, view, update, and delete quizzes for lessons. Each lesson can have one quiz consisting of multiple questions, where each question has multiple options with at least one correct answer.

## Diagrams Included

### 1. Class Diagram (`class-diagram.puml`)

Illustrates the complete architecture for managing lesson quizzes:

#### Layers

1. **Presentation Layer**:
   - `QuizFormPanel`: Form for creating/editing quizzes with questions and options
   - `QuizViewPanel`: Display quiz details with questions and options

2. **Controller Layer**:
   - `QuizController`: HTTP endpoints for quiz CRUD operations

3. **Service Layer**:
   - `QuizService`: Business logic for quiz management, validation, and ownership verification

4. **Entity Layer**:
   - `Quiz`: Quiz metadata (title, description, totalQuestions)
   - `Question`: Questions within a quiz (title, explanation)
   - `QuestionOption`: Answer options for questions (content, isCorrect)
   - `Lesson`: Parent entity for quizzes
   - `Subject`: Owns lessons (for ownership verification)
   - `User`: Quiz creator (coach)

5. **DTOs**:
   - `CreateQuizDto`, `CreateQuestionDto`, `CreateQuestionOptionDto`
   - `UpdateQuizDto`, `UpdateQuestionDto`, `UpdateQuestionOptionDto`

#### Key Relationships

- Quiz → Lesson (one-to-one, each lesson has at most one quiz)
- Quiz → Question (one-to-many, cascade insert)
- Question → QuestionOption (one-to-many, cascade insert)
- Quiz → User (many-to-one, createdBy)
- Lesson → Subject (many-to-one, for ownership chain)

### 2. Sequence Diagram: CRUD Operations (`sequence-crud.puml`)

Covers the main quiz management operations:

#### Create Quiz Flow

1. Coach navigates to a lesson
2. Clicks "Add Quiz"
3. Fills in quiz details:
   - Title (required)
   - Description (optional)
   - Questions (at least 1):
     - Title (required)
     - Explanation (optional)
     - Options (at least 2):
       - Content (required)
       - Mark correct answer(s)
4. System validates:
   - Lesson exists and has no quiz yet
   - Coach owns the subject (via lesson.subject.createdBy)
   - Each question has ≥2 options
   - Each question has ≥1 correct answer
5. Creates quiz with cascade insert for questions and options
6. Returns success response

#### View Quiz Flow

1. Coach views a lesson
2. System queries quiz by lesson ID
3. Loads quiz with all questions and options
4. Displays quiz details to coach

#### Update Quiz Flow

1. Coach clicks "Edit Quiz"
2. Loads existing quiz data into form
3. Coach modifies quiz details, questions, or options
4. System validates ownership and data integrity
5. Uses complete replacement strategy:
   - Removes old questions (cascade to options)
   - Inserts new questions with options
   - Updates quiz metadata
6. Returns success response

### 3. Sequence Diagram: Delete/Restore Operations (`sequence-delete-restore.puml`)

Covers soft delete and restore functionality:

#### Delete Quiz Flow

1. Coach views quiz
2. Clicks "Delete Quiz"
3. Confirms deletion
4. System verifies:
   - Quiz exists and not already deleted
   - Coach owns the subject
5. Soft deletes quiz (sets `deletedAt` timestamp)
6. Questions and options remain in database

#### Restore Quiz Flow

1. Coach views deleted quizzes (with `withDeleted=true` filter)
2. Clicks "Restore" on a deleted quiz
3. Confirms restoration
4. System verifies:
   - Quiz exists and is deleted
   - Coach owns the subject
5. Restores quiz (clears `deletedAt` timestamp)
6. Quiz becomes active again

## Important Design Notes

### One Quiz Per Lesson

- Each lesson can have at most **one quiz**
- Attempting to create a second quiz throws `ConflictException`
- Enforced at application level and database constraint

### Ownership Verification

- Quizzes inherit ownership from their lesson's subject
- Only the subject creator (coach) can:
  - Create quiz for lesson
  - Update quiz
  - Delete/restore quiz
- Ownership check: `lesson.subject.createdBy.id === currentUser.id`

### Cascade Operations

- Creating quiz cascades to questions and options (single transaction)
- Deleting questions cascades to options
- Soft delete on quiz does NOT cascade (questions remain)

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

### Soft Delete Pattern

- Delete sets `deletedAt` timestamp on quiz entity
- Questions and options remain in database
- Restore clears `deletedAt` timestamp
- Hard delete (if implemented) would cascade to questions and options

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

## API Endpoints

Suggested endpoints based on diagram flows:

```http
POST   /lessons/:lessonId/quiz          - Create quiz for lesson
GET    /lessons/:lessonId/quiz          - Get quiz by lesson ID
PUT    /quizzes/:id                     - Update quiz
DELETE /quizzes/:id                     - Soft delete quiz
PATCH  /quizzes/:id/restore             - Restore deleted quiz
GET    /quizzes?withDeleted=true        - List quizzes including deleted
```

## Security

- All endpoints protected by `AuthGuard` (authentication required)
- All endpoints protected by `RoleGuard` (COACH role required)
- Ownership verification on all mutation operations
- Only subject creator can manage quizzes for their lessons

## Transaction Management

Critical operations use database transactions:

- Quiz creation (quiz + questions + options)
- Quiz update (delete old + insert new)
- Ensures data consistency and rollback on errors

## Diagram Guidelines

### Sequence Diagram Rules

1. **Use Specific Instance Names (NOT generic class names)**:
   - ✅ `QuizController`, `QuizService`, `QuizRepository`, `LessonRepository`, `PostgreSQL`
   - ❌ `Controller`, `Service`, `Database`
   - ✅ `Web Browser` (not `Client`)

2. **Include Repository Layer**:
   - Always show repository layer between service and database
   - Show explicit repository method calls with parameters
   - Example: `lessonRepo: findOne(id, relations: ['subject.createdBy'])`
   - Show explicit SQL operations where appropriate
   - Example: `UPDATE quizzes SET deleted_at = NOW() WHERE id = ?`

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
   - Example: `service -> service: Verify ownership (lesson.subject.createdBy == currentUser)`

6. **Relations Parameter**:
   - Always include relations parameter in findOne/find calls
   - Example: `findOne(id, relations: ['lesson.subject', 'questions.options'])`
