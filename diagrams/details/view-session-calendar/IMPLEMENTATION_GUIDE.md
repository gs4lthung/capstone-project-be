# View Session Calendar Feature - Implementation Guide

## Overview

The "View Session Calendar" feature allows users (coaches and learners) to view all sessions of a course in a calendar format. Users can see session details, check availability, filter by date, and export the calendar to external tools like Google Calendar or Outlook.

## Feature Scope

### User-Side Operations

- **View Calendar Grid**: Display all course sessions in a calendar view (monthly/weekly)
- **View Session Details**: Click on a session to see full details (date, time, duration, location, participants)
- **Filter Sessions**: Filter by date range or status
- **Check Availability**: See enrollment status and available spots

## Database Schema

### Key Entities

**Session Entity** - Located in `libs/database/src/entities/session.entity.ts`

Properties:
- `id`: Primary key (numeric)
- `sessionNumber`: Sequential session number
- `scheduleDate`: Date of the session
- `startTime`: Start time (HH:MM format)
- `endTime`: End time (HH:MM format)
- `durationInMinutes`: Session duration
- `status`: Session status (enum: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)
- `completedAt`: Completion timestamp (optional)
- `createdAt`, `updatedAt`: Timestamps

Relationships:
- `course`: Parent course
- `enrollments`: List of enrollments for this session

**Enrollment Entity** - Located in `libs/database/src/entities/enrollment.entity.ts`

Properties:
- `id`: Primary key
- `enrollmentDate`: Date user enrolled
- `status`: Enrollment status (enum: ACTIVE, COMPLETED, CANCELLED)

Relationships:
- `user`: Enrolled user
- `session`: Session enrolled in
- `course`: Associated course

**Course Entity** - Located in `libs/database/src/entities/course.entity.ts`

Key properties for calendar:
- `id`: Course ID
- `name`: Course name
- `startDate`: Course start date
- `endDate`: Course end date
- `level`: Pickleball skill level
- `maxParticipants`: Maximum course participants

Relationships:
- `sessions`: All sessions for this course
- `court`: Course location/court

## DTOs

### SessionCalendarDto

Represents a session for calendar display:

```typescript
export class SessionCalendarDto {
  id: number;
  sessionNumber: number;
  scheduleDate: Date;
  startTime: string;          // HH:MM
  endTime: string;            // HH:MM
  status: SessionStatus;
  currentEnrollments: number;
  maxCapacity: number;
  availableSpots: number;
}
```

### CalendarFilterDto

For filtering calendar sessions:

```typescript
export class CalendarFilterDto {
  dateFrom?: Date;
  dateTo?: Date;
  status?: SessionStatus;
  sortBy?: string;            // date | sessionNumber
}
```

### CalendarExportDto

For exporting calendar:

```typescript
export class CalendarExportDto {
  format: 'ics' | 'pdf' | 'json';
  dateRange?: {
    from: Date;
    to: Date;
  };
}
```

## API Endpoints

### GET /api/v1/courses/:id

Retrieve course details with sessions.

**Response**:
```json
{
  "id": 1,
  "name": "Beginner Pickleball",
  "startDate": "2025-01-15",
  "endDate": "2025-03-15",
  "sessions": [
    {
      "id": 101,
      "sessionNumber": 1,
      "scheduleDate": "2025-01-15",
      "startTime": "10:00",
      "endTime": "11:00",
      "status": "SCHEDULED",
      "currentEnrollments": 8,
      "maxCapacity": 12,
      "availableSpots": 4
    }
  ],
  "court": {
    "id": 1,
    "name": "Main Court",
    "address": "123 Sports Lane"
  }
}
```

### GET /api/v1/courses/:id/sessions

Get sessions with filtering and pagination.

**Query Parameters**:
- `dateFrom`: Start date (YYYY-MM-DD)
- `dateTo`: End date (YYYY-MM-DD)
- `status`: Filter by session status
- `sortBy`: Sort field (date | sessionNumber)
- `page`: Page number
- `size`: Page size

**Response**:
```json
{
  "data": [
    {
      "id": 101,
      "sessionNumber": 1,
      "scheduleDate": "2025-01-15",
      "startTime": "10:00",
      "endTime": "11:00",
      "status": "SCHEDULED",
      "currentEnrollments": 8,
      "maxCapacity": 12,
      "availableSpots": 4
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10
  }
}
```

### GET /api/v1/courses/:id/sessions/:sessionId

Get detailed information about a specific session.

**Response**:
```json
{
  "id": 101,
  "sessionNumber": 1,
  "scheduleDate": "2025-01-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "duration": 60,
  "status": "SCHEDULED",
  "course": {
    "id": 1,
    "name": "Beginner Pickleball"
  },
  "court": {
    "id": 1,
    "name": "Main Court",
    "address": "123 Sports Lane"
  },
  "enrollments": [
    {
      "id": 1,
      "user": {
        "id": 101,
        "name": "John Doe"
      },
      "status": "ACTIVE"
    }
  ],
  "enrollmentStats": {
    "total": 8,
    "maxCapacity": 12,
    "availableSpots": 4,
    "isFull": false
  }
}
```

## Implementation Requirements

### 1. Controller Methods

**getCourseSessions()**

- GET /courses/:id/sessions
- Query parameters for filtering and sorting
- Return paginated SessionCalendarDto array

**getSessionDetails()**

- GET /courses/:id/sessions/:sessionId
- Include enrollment information
- Calculate availability stats

### 2. Service Methods

**CourseService**:

- `getCalendarView(courseId, filter)` - Get sessions for calendar display
- `getSessionDetails(sessionId)` - Get full session details with enrollments

**SessionService**:

- `findSessionsByDateRange(courseId, from, to)` - Query sessions in date range
- `getSessionAvailability(sessionId)` - Calculate available spots
- `getSessionEnrollments(sessionId)` - Get enrolled users

**CalendarService** (new):

- `buildCalendarGrid(sessions)` - Organize sessions into calendar structure
- `filterSessions(sessions, filter)` - Apply date/status filters

**EnrollmentService**:

- `getSessionEnrollmentCount(sessionId)` - Count enrollments
- `isSessionFull(sessionId)` - Check if at capacity

### 3. Database Queries

**Query sessions with enrollment count** (important for performance):

```typescript
const sessions = await this.sessionRepository
  .createQueryBuilder('session')
  .where('session.course_id = :courseId', { courseId })
  .leftJoinAndSelect('session.enrollments', 'enrollments')
  .leftJoinAndSelect('enrollments.user', 'user')
  .leftJoinAndSelect('session.course', 'course')
  .leftJoinAndSelect('course.court', 'court')
  .orderBy('session.scheduleDate', 'ASC')
  .addOrderBy('session.startTime', 'ASC')
  .getMany();
```

### 4. Filtering Logic

**Date Range Filter**:
```typescript
if (filter.dateFrom || filter.dateTo) {
  const from = filter.dateFrom || course.startDate;
  const to = filter.dateTo || course.endDate;
  sessions = sessions.filter(s => 
    s.scheduleDate >= from && s.scheduleDate <= to
  );
}
```

**Status Filter**:
```typescript
if (filter.status) {
  sessions = sessions.filter(s => s.status === filter.status);
}
```

### 5. Export Formats

The export functionality has been removed. Focus on filtering and displaying sessions in calendar view.

### 6. Performance Optimization

**Eager Load Relationships**:
```typescript
.leftJoinAndSelect('session.enrollments', 'enrollments')
.leftJoinAndSelect('course.court', 'court')
```

**Add Database Indexes**:
```sql
CREATE INDEX idx_session_course_date 
  ON sessions(course_id, schedule_date);
  
CREATE INDEX idx_enrollment_session 
  ON enrollments(session_id);
```

**Cache Calendar Data**:
- Cache calendar grid for expensive operations
- Invalidate on session/enrollment changes

## Validation

**Date Validation**:

- `dateFrom` must be before or equal to `dateTo`
- Dates must be within course start/end dates

**Status Validation**:

- Only accept valid SessionStatus enum values

## Error Handling

| Error | Status | Message |
|-------|--------|---------|
| Course not found | 404 | "Course not found" |
| Session not found | 404 | "Session not found" |
| Invalid date range | 400 | "Invalid date range" |
| Invalid format | 400 | "Invalid export format" |
| Export generation failed | 500 | "Failed to generate calendar export" |

## Frontend Integration Points

### Calendar Views

1. **Monthly Calendar Grid**
   - Display sessions as dots/badges on calendar dates
   - Click to see details
   - Show available spots indicator

2. **List View**
   - Show sessions in chronological order
   - Include date, time, duration, location
   - Show enrollment status

3. **Session Details Modal**
   - Full session information
   - Enrolled participants list
   - Enroll button if available

### Export Integration

1. **Export Button**
   - Dropdown to select format
   - Optional date range selection
   - Download trigger

2. **Calendar Import**
   - Instructions to import ICS to Google Calendar/Outlook
   - Direct import links if available

## Testing Strategy

### Unit Tests

```typescript
describe('CalendarService', () => {
  describe('filterSessions', () => {
    it('should filter sessions by date range', async () => {
      // Test date filtering
    });

    it('should filter sessions by status', async () => {
      // Test status filtering
    });

    it('should sort sessions correctly', async () => {
      // Test sorting
    });
  });

  describe('exportAsIcs', () => {
    it('should generate valid ICS format', async () => {
      // Test ICS generation
    });
  });
});
```

### E2E Tests

```typescript
describe('Calendar Endpoints (e2e)', () => {
  it('should retrieve course sessions', async () => {
    // Test GET /courses/:id/sessions
  });

  it('should export calendar as ICS', async () => {
    // Test GET /courses/:id/sessions/export?format=ics
  });
});
```

## Diagrams

Two diagrams are provided:

### Sequence Diagram (`sequence-diagram.puml`)

Shows the complete flow:

1. View course calendar
2. Filter sessions by date
3. View session details
4. Check availability

### Class Diagram (`class-diagram.puml`)

Shows the structure of:

- Session, Enrollment, Course entities
- CourseController endpoints
- CourseService, SessionService, CalendarService, EnrollmentService
- DTOs for calendar operations
- Relationships between components

## References

- **Session Entity**: `libs/database/src/entities/session.entity.ts`
- **Enrollment Entity**: `libs/database/src/entities/enrollment.entity.ts`
- **Course Entity**: `libs/database/src/entities/course.entity.ts`
- **Course Controller**: `apps/api-gateway/src/controllers/course.controller.ts`
- **Course Service**: `apps/api-gateway/src/services/course.service.ts`
- **Project Instructions**: `.github/copilot-instructions.md`
