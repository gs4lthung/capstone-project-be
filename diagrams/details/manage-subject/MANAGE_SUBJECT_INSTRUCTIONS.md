# Manage Subject Feature Diagrams

## Overview

This feature allows coaches to manage (create, read, update, delete, restore) subjects without involving lessons, quizzes, or videos. Subjects are foundational curriculum containers with a lifecycle (DRAFT → PUBLISHED).

## Diagrams Included

### 1. Sequence Diagram: CRUD Operations (`sequence-crud.puml`)

Covers the main subject management operations:

- **Create Subject**: Coach creates new subject with optional icon upload via Bunny CDN
- **View All Subjects**: Paginated listing with filtering, sorting
- **View Subject Details**: Individual subject view with all metadata
- **Update Subject**: Modify subject properties, with validation when status changes to PUBLISHED

#### Key Flow Notes

- Subject creation sets status to DRAFT automatically
- Publishing a subject triggers validation (only checks future lesson requirements)
- Icon/image file upload is optional and goes through Bunny CDN
- All operations require COACH role

### 2. Sequence Diagram: Delete/Restore Operations (`sequence-delete-restore.puml`)

Covers soft delete and restore functionality:

- **Delete Subject**: Soft delete with ownership verification
- **Restore Subject**: Undelete previously deleted subjects

#### Delete/Restore Flow Notes

- Delete performs soft delete (sets `deletedAt` timestamp)
- Authorization check: Only subject creator can delete
- Restore operation uses `withDeleted=true` to find soft-deleted records
- Restore clears the `deletedAt` timestamp

### 3. Class Diagram (`class.puml`)

Illustrates the architecture for subject management **without** lessons, videos, or quizzes:

#### Intentional Exclusions

❌ **NOT included** (as requested):

- Lesson entity
- Video entity
- Quiz entity
- Course relationships (reference only for later linking)

#### Included Components

✅ **Layers**:

1. **Presentation**: SubjectListPanel, SubjectFormPanel (UI components)
2. **Controller**: SubjectController (HTTP handlers)
3. **Service**: SubjectService (business logic, CRUD, soft delete/restore)
4. **Entity**: Subject, User, Role (database models)
5. **Utilities**: BunnyService (file upload), DataSource (transactions)
6. **Security**: AuthGuard, RoleGuard (coach-only access)

#### DTOs

- `CreateSubjectDto`: name, description, level (file handled separately)
- `UpdateSubjectDto`: optional updates + status + publicUrl

#### Enums

- `PickleballLevel`: BEGINNER, INTERMEDIATE, ADVANCED
- `SubjectStatus`: DRAFT, PUBLISHED

## Important Design Notes

### Status Workflow

- New subjects start in **DRAFT** status
- Status can be changed to **PUBLISHED** via update
- Publication validation: All lessons must have video AND quiz (checked in service)
- This feature only manages the subject itself, not lesson requirements

### Soft Delete Pattern

- Delete doesn't remove data, only sets `deletedAt` timestamp
- Restore clears the `deletedAt` timestamp
- Ownership check: Only creator can delete/restore their own subjects

### File Upload

- Icon/image is optional during creation
- Upload goes through BunnyService → stored in Bunny CDN
- Returns `publicUrl` stored in Subject entity

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/subjects` | List all subjects (pagination, filter, sort) |
| GET | `/subjects/:id` | Get single subject details |
| POST | `/subjects` | Create new subject |
| PUT | `/subjects/:id` | Update subject |
| DELETE | `/subjects/:id` | Delete (soft delete) subject |
| PATCH | `/subjects/:id/restore` | Restore deleted subject |

## Related Features

- **Manage Lesson** (future): Add lessons to subjects, upload lesson videos
- **Create Course**: Link subjects and lessons into courses
- **Quiz Management** (future): Add quizzes to lessons

## Implementation Checklist

- [x] Subject CRUD operations
- [x] Soft delete with restore
- [x] Icon upload to Bunny CDN
- [x] Status management (DRAFT/PUBLISHED)
- [x] Ownership-based access control
- [x] Pagination and filtering
- [ ] (Future) Lesson content management
- [ ] (Future) Publication workflow with lesson validation
