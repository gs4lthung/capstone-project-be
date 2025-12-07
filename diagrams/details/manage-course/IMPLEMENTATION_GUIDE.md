# Manage Course Feature - Implementation Guide

## Overview

The "Manage Course" feature enables coaches to view, create, and update their courses. Coaches can modify course details, schedules, and images while courses are in the PENDING_APPROVAL or DRAFT status.

## Feature Scope

### Coach-Side Operations

- **View My Courses**: Browse all courses created by the coach with pagination
- **Update Course Details**: Edit course information (name, description, level, learning format, pricing, dates, etc.)
- **Modify Course Schedule**: Adjust course session timing and days of the week
- **Upload Course Image**: Add or update course thumbnail image
- **View Course Details**: See full course information including sessions, schedules, and participants

## Database Schema

### Key Entities

The following entities are involved in the manage course feature:

**Course Entity** - Located in `libs/database/src/entities/course.entity.ts`

Properties:
- `id`: Primary key (numeric)
- `name`: Course name (string, max 100 chars)
- `description`: Course description (text, optional)
- `level`: Pickleball skill level (enum: BEGINNER, INTERMEDIATE, ADVANCED, PROFESSIONAL)
- `learningFormat`: Format type (enum: GROUP, INDIVIDUAL, HYBRID)
- `status`: Course status (enum: DRAFT, PENDING_APPROVAL, APPROVED, ACTIVE, ARCHIVED, REJECTED, CANCELLED)
- `startDate`: Course start date
- `endDate`: Course end date (optional)
- `minParticipants`: Minimum participants required
- `maxParticipants`: Maximum participants allowed
- `pricePerParticipant`: Price per participant
- `currentParticipants`: Current enrollment count
- `totalSessions`: Total number of sessions
- `publicUrl`: Course image URL (optional)
- `googleMeetLink`: Google Meet link (optional)
- `createdAt`, `updatedAt`: Timestamps

Relationships:
- `createdBy`: User who created the course
- `subject`: Subject/category of the course
- `court`: Court location for the course
- `sessions`: List of sessions
- `schedules`: List of schedules
- `enrollments`: List of enrolled learners

**Schedule Entity** - Located in `libs/database/src/entities/schedule.entity.ts`

Properties:
- `id`: Primary key
- `dayOfWeek`: Day of week (0=Sunday to 6=Saturday)
- `startTime`: Session start time (HH:MM format)
- `endTime`: Session end time (HH:MM format)
- `totalSessions`: Total sessions for this schedule

Relationships:
- `course`: Parent course

**Session Entity** - Located in `libs/database/src/entities/session.entity.ts`

Properties:
- `id`: Primary key
- `sessionNumber`: Session number in sequence
- `scheduleDate`: Date of the session
- `startTime`: Session start time
- `endTime`: Session end time
- `durationInMinutes`: Session duration
- `status`: Session status (enum: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)
- `completedAt`: Completion timestamp

## DTOs

### UpdateCourseDto

Located in `libs/shared/src/dtos/course/course.dto.ts`

Fields (all optional):
- `name`: string (max 100 chars)
- `description`: string
- `level`: PickleballLevel enum
- `learningFormat`: CourseLearningFormat enum
- `startDate`: Date
- `endDate`: Date
- `minParticipants`: number (min 1)
- `maxParticipants`: number (min 1)
- `pricePerParticipant`: number (min 0)
- `publicUrl`: string
- `googleMeetLink`: string
- `schedules`: Array of ScheduleInput
- `courtId`: number

### ScheduleInput

```typescript
interface ScheduleInput {
  dayOfWeek: number;        // 0-6
  startTime: string;        // HH:MM
  endTime: string;          // HH:MM
  totalSessions: number;    // Total sessions for this day
}
```

## API Endpoints

### GET /api/v1/courses/coach

Retrieve all courses created by the authenticated coach.

**Query Parameters**:
- `page`: Page number (default: 1)
- `size`: Page size (default: 10)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Beginner Pickleball Course",
      "status": "PENDING_APPROVAL",
      "level": "BEGINNER",
      "startDate": "2025-01-15",
      "createdAt": "2025-01-10T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

### GET /api/v1/courses/:id

Retrieve detailed information about a specific course.

**Response**:
```json
{
  "id": 1,
  "name": "Beginner Pickleball Course",
  "description": "Learn the basics of pickleball",
  "level": "BEGINNER",
  "learningFormat": "GROUP",
  "status": "PENDING_APPROVAL",
  "startDate": "2025-01-15",
  "endDate": "2025-03-15",
  "minParticipants": 4,
  "maxParticipants": 12,
  "pricePerParticipant": 50,
  "currentParticipants": 5,
  "totalSessions": 10,
  "publicUrl": "https://cdn.example.com/courses/1.jpg",
  "createdBy": { "id": 1, "name": "Coach John" },
  "subject": { "id": 1, "name": "Pickleball" },
  "schedules": [
    {
      "id": 1,
      "dayOfWeek": 1,
      "startTime": "10:00",
      "endTime": "11:00",
      "totalSessions": 5
    }
  ],
  "sessions": [
    {
      "id": 1,
      "sessionNumber": 1,
      "scheduleDate": "2025-01-15",
      "startTime": "10:00",
      "endTime": "11:00",
      "status": "SCHEDULED"
    }
  ]
}
```

### PUT /api/v1/courses/:id

Update an existing course.

**Headers**:
- `Authorization: Bearer <token>`

**Body**:
```json
{
  "name": "Updated Course Name",
  "description": "Updated description",
  "level": "INTERMEDIATE",
  "learningFormat": "GROUP",
  "startDate": "2025-01-20",
  "endDate": "2025-03-20",
  "minParticipants": 5,
  "maxParticipants": 15,
  "pricePerParticipant": 60,
  "publicUrl": "https://cdn.example.com/courses/1-updated.jpg",
  "schedules": [
    {
      "dayOfWeek": 1,
      "startTime": "10:00",
      "endTime": "11:00",
      "totalSessions": 5
    },
    {
      "dayOfWeek": 3,
      "startTime": "10:00",
      "endTime": "11:00",
      "totalSessions": 5
    }
  ]
}
```

**File Upload** (optional):
- `course_image`: Multipart file upload for course thumbnail

**Response**:
```json
{
  "message": "Course updated successfully",
  "data": { ... updated course object ... },
  "statusCode": 200
}
```

## Implementation Requirements

### 1. Controller Implementation

The `CourseController` should have the following methods:

- `getCoursesForCoach(page, size)` - GET /courses/coach
- `findOne(id)` - GET /courses/:id
- `updateCourseCreationRequest(id, data, file)` - PUT /courses/:id

Each method should:
- Include proper guard decorators (`@UseGuards(AuthGuard, RoleGuard)`)
- Include proper role check (`@CheckRoles(UserRole.COACH)`)
- Include Swagger decorators for API documentation
- Return proper HTTP status codes and error messages

### 2. Service Implementation

The `CourseService` should have the following key methods:

**findCoachCourses(page, size)**
- Query courses where `createdBy` matches current user
- Include relationships: sessions, schedules
- Sort by createdAt descending
- Apply pagination

**findOne(id)**
- Query course by ID with all relationships
- Use transaction for consistency
- Join: sessions, schedules, subject, court, createdBy

**updateCourseCreationRequest(id, data, file)**
- Verify course exists
- Verify user is course creator
- Validate course status is DRAFT or PENDING_APPROVAL
- Update course fields from DTO
- Handle file upload if provided:
  - Use BunnyService.uploadFile()
  - Store URL in publicUrl field
- If schedules provided:
  - Delete existing schedules
  - Create new schedules from input
- Return updated course with all relationships

### 3. Authentication & Authorization

- Use `@UseGuards(AuthGuard)` for endpoints requiring authentication
- Use `@UseGuards(AuthGuard, RoleGuard)` with `@CheckRoles(UserRole.COACH)` for coach-only endpoints
- Verify user ownership of course before allowing updates
- Current user ID available via `this.request.user?.id`

### 4. File Upload

- Use `FileInterceptor` middleware for file handling
- Validate file size using `FileSizeLimitEnum.IMAGE`
- Use `BunnyService.uploadFile()` for uploading
- Store returned URL in `publicUrl` field

### 5. Validation

- Use class-validator decorators on DTOs
- Validate date ranges: startDate <= endDate
- Validate participant counts: minParticipants <= maxParticipants
- Validate schedule days: 0-6
- Validate times: valid HH:MM format

### 6. Error Handling

Use `BadRequestException` for:
- Course not found
- User not authorized to update course
- Invalid course status for update
- Invalid input data

Return `CustomApiResponse` for success with:
- `message`: Success message
- `data`: Updated course object
- `statusCode`: 200

## Diagrams

Two diagrams are provided to visualize the feature:

### Sequence Diagram (`sequence-approval.puml`)
Shows the interaction flow between coach, client, controller, service, and database for:
1. Viewing coach's courses
2. Updating course details and image
3. Persisting changes to database

### Class Diagram (`class-diagram.puml`)
Shows the structure of:
- Course, Schedule, Session entities with properties
- CourseController with endpoints
- CourseService with methods
- DTOs (UpdateCourseDto, CreateCourseRequestDto)
- Enums (CourseStatus, PickleballLevel, etc.)
- Relationships between components

## References

- **Course Entity**: `libs/database/src/entities/course.entity.ts`
- **Schedule Entity**: `libs/database/src/entities/schedule.entity.ts`
- **Session Entity**: `libs/database/src/entities/session.entity.ts`
- **Course Controller**: `apps/api-gateway/src/controllers/course.controller.ts`
- **Course Service**: `apps/api-gateway/src/services/course.service.ts`
- **Course DTOs**: `libs/shared/src/dtos/course/course.dto.ts`
- **Project Instructions**: `.github/copilot-instructions.md`
