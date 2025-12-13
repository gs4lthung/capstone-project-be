# Feature: Manage Lesson

## Controllers

| Class | No | Method | Description |
|-------|----|--------------------|-------------|

### LessonController

| No | Method | Description |
|----|--------|-------------|
| 1 | findAllBySubjectId(id, pagination, sort, filter) | Get all lessons by subject ID with pagination, sorting, filtering |
| 2 | findAllByCourseId(id, pagination, sort, filter) | Get all lessons by course ID with pagination, sorting, filtering |
| 3 | createSubject(id, data) | Create new lesson for subject with auto lessonNumber (COACH only) |
| 4 | updateLesson(id, data) | Update existing lesson properties (COACH only) |
| 5 | deleteLesson(id) | Soft delete lesson by ID (COACH only) |
| 6 | restoreLesson(id) | Restore soft-deleted lesson (COACH only) |

## Services

### LessonService

| No | Method | Description |
|----|--------|-------------|
| 1 | findAll(findOptions) | Query all lessons with pagination, sorting, filtering |
| 2 | findAllBySubjectId(findOptions, subjectId) | Query lessons by subject ID with filters |
| 3 | create(subjectId, data) | Transaction: verify subject ownership, auto-assign lessonNumber (count + 1), create lesson |
| 4 | update(id, data) | Transaction: verify ownership via subject.createdBy, update lesson properties |
| 5 | delete(id) | Transaction: verify ownership, soft delete lesson (set deletedAt) |
| 6 | restore(id) | Transaction: verify ownership, restore lesson (clear deletedAt) |

## Guards

### AuthGuard
Validates JWT token from request headers for all lesson endpoints.

### RoleGuard
Checks user has COACH role for create, update, delete, restore operations.

## Entities

### Lesson
Represents a lesson in a subject. Properties: id, name, description, duration, lessonNumber, subject (Subject), video (Video), quiz (Quiz), createdAt, updatedAt, deletedAt.

### Subject
Represents a subject containing lessons. Properties: id, name, description, level, status, lessons (Lesson[]), createdBy (User).

### User
Represents the coach who creates lessons. Properties: id, fullName, email, role.

### Video
Optional video associated with lesson. Properties: id, title, publicUrl, lesson.

### Quiz
Optional quiz associated with lesson. Properties: id, title, questions, lesson.

## DTOs

### CreateLessonRequestDto
Input for creating lesson. Fields: name (string), description (string, optional), duration (number, optional).

### UpdateLessonDto
Input for updating lesson. All fields optional: name?, description?, duration?.

## Scope Rules

- **Ownership Validation**: All create/update/delete/restore operations verify that subject.createdBy matches current user
- **Auto LessonNumber**: When creating lesson, lessonNumber is automatically assigned as subject.lessons.length + 1
- **Soft Delete**: Lessons are soft deleted with deletedAt timestamp, can be restored
- **Transaction Safety**: All mutations wrapped in database transactions for consistency
- **Relations**: Lessons always belong to a Subject, may optionally have Video and Quiz
- **Filtering**: Supports pagination, sorting by any field, and filtering by lesson properties
