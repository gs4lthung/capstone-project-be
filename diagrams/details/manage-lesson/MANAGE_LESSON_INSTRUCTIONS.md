# Manage Lesson Feature Diagrams

## Overview

This feature allows coaches to manage lessons within a subject. Lessons are structural containers organized by subject with auto-incrementing lesson numbers. Videos and quizzes are added to lessons separately (not covered by this diagram set).

## Diagrams Included

### 1. Sequence Diagram: CRUD Operations (`sequence-crud.puml`)

Covers the main lesson management operations:

- **Create Lesson**: Coach adds new lesson to subject with auto-calculated lesson number
- **View All Lessons by Subject**: Paginated, filterable listing of lessons in a subject
- **View Lessons by Course**: Query lessons through course (uses same subject query logic)
- **Update Lesson**: Modify lesson details (name, description, duration)

#### Key Flow Notes

- Lesson creation auto-increments `lessonNumber` based on existing lessons in subject
- Owner verification: Only subject creator can create/edit lessons
- Lessons are always scoped to a subject (no orphan lessons)
- Pagination, sorting, and filtering available for lesson lists

### 2. Sequence Diagram: Delete/Restore Operations (`sequence-delete-restore.puml`)

Covers soft delete and restore functionality:

- **Delete Lesson**: Soft delete with subject ownership verification
- **Restore Lesson**: Undelete previously deleted lessons

#### Delete/Restore Flow Notes

- Delete performs soft delete (sets `deletedAt` timestamp)
- Ownership check: Only subject creator can delete/restore lessons
- Restore clears the `deletedAt` timestamp
- Uses `withDeleted=true` flag to query soft-deleted lessons

### 3. Class Diagram (`class.puml`)

Illustrates the architecture for lesson management **focused on lesson structure**:

#### Intentional Exclusions

❌ **NOT included** (separate features):

- Video entity/content
- Quiz entity/content
- Session entity
- Lesson-to-video mapping details
- Lesson-to-quiz mapping details

#### Included Components

✅ **Layers**:

1. **Presentation**: LessonListPanel, LessonFormPanel (UI components)
2. **Controller**: LessonController (HTTP handlers)
3. **Service**: LessonService (business logic, CRUD, soft delete/restore)
4. **Entity**: Lesson, Subject, User, Role (database models)
5. **Infrastructure**: DataSource (transaction management)
6. **Security**: AuthGuard, RoleGuard (coach-only access)

#### DTOs

- `CreateLessonRequestDto`: name, description, duration (lessonNumber auto-assigned)
- `UpdateLessonDto`: optional updates to name, description, duration

#### Key Relationships

- Lesson → Subject (many-to-one, cascading delete)
- Subject → Lesson (one-to-many)
- Subject → User (createdBy ownership)
- Lesson inherits Subject level (PickleballLevel)

## Important Design Notes

### Auto-Incrementing Lesson Numbers

- `lessonNumber` is calculated as: `existing_lessons.length + 1`
- Not user-settable during creation
- Provides natural ordering within a subject

### Soft Delete Pattern

- Delete doesn't remove data, only sets `deletedAt` timestamp
- Restore clears the `deletedAt` timestamp
- Ownership check: Only subject creator can delete/restore

### Ownership Verification

- Lessons belong to subjects
- Authority comes from subject creator
- Both create and update require ownership check on subject
- Delete/restore also verify subject ownership

### Lesson Scope

- All lessons are scoped to exactly one subject
- Cannot create orphan lessons
- If subject is deleted (soft), child lessons may be affected by cascade
- Lessons can be queried by subject ID or course ID (through subject)

## API Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/lessons/subjects/:id` | List lessons by subject (with pagination, filter, sort) | COACH+ |
| GET | `/lessons/courses/:id` | List lessons by course (redirects to subject query) | COACH+ |
| POST | `/lessons/subjects/:id` | Create new lesson in subject | COACH |
| PUT | `/lessons/:id` | Update lesson | COACH |
| DELETE | `/lessons/:id` | Delete (soft delete) lesson | COACH |
| PATCH | `/lessons/:id/restore` | Restore deleted lesson | COACH |

## Related Features

- **Manage Subject**: Create/update/delete subjects (lessons belong here)
- **Upload Lesson Video** (future): Add video content to lessons
- **Create Quiz** (future): Add quiz questions to lessons
- **Create Session** (future): Schedule lessons in courses

## Implementation Checklist

- [x] Lesson CRUD operations
- [x] Auto-increment lesson numbering
- [x] Soft delete with restore
- [x] Subject-scoped lesson management
- [x] Ownership-based access control
- [x] Pagination and filtering
- [ ] (Future) Video content upload
- [ ] (Future) Quiz assignment
- [ ] (Future) Session scheduling
