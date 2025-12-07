# Approve/Reject Course Diagram Instructions

## Overview

The Approve/Reject Course diagrams illustrate the admin workflow for reviewing and approving course creation requests or rejecting them with feedback.

For general class diagram guidelines, see: [`../CLASS_DIAGRAM_INSTRUCTIONS.md`](../CLASS_DIAGRAM_INSTRUCTIONS.md)

## Diagrams Included

### 1. Sequence Diagrams

#### Approve Course (sequence.puml)

Shows the workflow for approving a course creation request:

1. Admin views pending course requests
2. System queries courses filtered by PENDING_APPROVAL status
3. Admin selects course to review
4. System retrieves course details with all lessons, videos, and quizzes
5. Admin reviews course content, structure, and metadata
6. Admin clicks approve button
7. System:
   - Validates course has content (sessions, lessons)
   - Updates course status to APPROVED
   - Generates sessions from schedules
   - Creates video and quiz records for each session
   - Records approval action
   - Sends notification to coach
8. Approval complete

#### Reject Course (sequence-reject.puml)

Shows the workflow for rejecting a course creation request:

1. Admin views pending course requests
2. System queries courses filtered by PENDING_APPROVAL status
3. Admin selects course to review
4. System retrieves course details with all lessons, videos, and quizzes
5. Admin reviews course and identifies issues
6. Admin enters rejection reason and clicks reject
7. System:
   - Updates course status to REJECTED
   - Updates request status to REJECTED
   - Records rejection action with reason
   - Sends notification to coach with rejection details
8. Rejection complete

### 2. Class Diagram (class.puml)

**Presentation Layer**
- **CourseApprovalPanel**: Admin interface for course approval
  - Display list of pending courses
  - Show course details (name, description, level, format)
  - Show course content structure
  - Approve/reject buttons with reason input

**Controller Layer**
- **CourseController**: REST endpoints
  - GET /courses/requests - List course requests with filtering
  - GET /courses/requests/:id - Get course request details
  - PATCH /courses/requests/:id/approve - Approve course (admin only)
  - PATCH /courses/requests/:id/reject - Reject course (admin only)

**Service Layer**
- **CourseService**: Business logic
  - Queries course requests with filtering
  - Validates course completeness
  - Updates course and request status
  - Generates sessions from schedules
  - Records request actions
  - Sends notifications

- **SessionService**: Generates sessions from course schedules
- **NotificationService**: Sends notifications to coaches

**Entity Layer**
- **Course**: Course entity
  - Basic info: name, description, level, format
  - Status: PENDING_APPROVAL, APPROVED, REJECTED, etc.
  - Relations: subject, sessions, enrollments, createdBy

- **Request**: Course creation request entity
  - Tracks request status and metadata
  - Links to course
  - Records request actions

- **RequestAction**: Action audit trail
  - Records who approved/rejected and why
  - Stores approval/rejection comments

- **Session**: Individual course session
  - Links lesson to course execution
  - Contains video and quiz for session

- **Subject**: Course subject/topic
  - Contains lessons

- **Lesson**: Individual lesson within subject
  - References video and quiz content

- **Video**: Video content for lesson
- **Quiz**: Quiz/test for lesson
- **User**: Coach and admin users
- **Role**: Admin role

**Enums**
- **CourseStatus**: PENDING_APPROVAL, APPROVED, REJECTED, READY_OPENED, FULL, CANCELLED
- **RequestStatus**: PENDING, APPROVED, REJECTED
- **RequestActionType**: APPROVED, REJECTED, COMMENTED

**Security Layer**
- **AuthGuard**: Verifies user is authenticated
- **RoleGuard**: Verifies user has admin role

## Course Approval Workflow

### Step 1: View Pending Courses

```
Admin Dashboard
    ↓
GET /courses/requests?filter=PENDING_APPROVAL
    ↓
Filter by status = PENDING_APPROVAL
    ↓
Display list with pagination
```

### Step 2: View Course Details

```
Admin clicks course
    ↓
GET /courses/requests/:id
    ↓
Retrieve:
  - Course info (name, level, format, dates)
  - Subject and lessons structure
  - Video content
  - Quiz content
  - Metadata and schedules
    ↓
Display in approval panel
```

### Step 3: Approve Course

```
Admin clicks APPROVE
    ↓
PATCH /courses/requests/:id/approve
    ↓
Transaction:
  1. Validate request pending
  2. Validate course has sessions
  3. Generate sessions from schedules
  4. Create video records for sessions
  5. Create quiz records for sessions
  6. Update Course status = APPROVED
  7. Update Request status = APPROVED
  8. Record RequestAction (type=APPROVED)
  9. Send notification to coach
    ↓
Success response
```

### Step 4: Reject Course

```
Admin enters reason + clicks REJECT
    ↓
PATCH /courses/requests/:id/reject
    ↓
Transaction:
  1. Validate request not already processed
  2. Update Course status = REJECTED
  3. Update Request status = REJECTED
  4. Record RequestAction (type=REJECTED, comment=reason)
  5. Send notification to coach with reason
    ↓
Success response
```

## What Admin Reviews

When approving a course, admins verify:

1. **Basic Information**
   - Course name and description
   - Level (Beginner, Intermediate, Advanced)
   - Learning format (Group, Individual)

2. **Course Structure**
   - Subject is defined
   - Lessons exist within subject
   - Minimum number of lessons/sessions

3. **Content Quality**
   - Videos attached to lessons
   - Quiz questions and options present
   - Video status is READY

4. **Scheduling**
   - Start and end dates defined
   - Start date <= end date
   - Schedules properly configured

5. **Enrollment Settings**
   - Min/max participants defined
   - Max >= Min participants

## API Endpoints

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| GET | /courses/requests | - | List course requests (with filtering) |
| GET | /courses/requests/:id | - | Get course request details |
| PATCH | /courses/requests/:id/approve | ADMIN | Approve course request |
| PATCH | /courses/requests/:id/reject | ADMIN | Reject course with reason |

## Request/Response Examples

### Approve Course

```typescript
PATCH /courses/requests/5/approve

Response:
{
  "statusCode": 201,
  "message": "COURSE.CREATE_SUCCESS",
  "data": null
}
```

### Reject Course

```typescript
PATCH /courses/requests/5/reject

Body:
{
  "reason": "Course is missing video content for lessons. Please add videos and resubmit."
}

Response:
{
  "statusCode": 200,
  "message": "COURSE.REJECT_SUCCESS",
  "data": null
}
```

## Course Status States

| Status | Meaning | Who can change | Next State |
|--------|---------|----------------|-----------|
| PENDING_APPROVAL | Initial state after creation | Admin (approve/reject) | APPROVED / REJECTED |
| APPROVED | Admin approved course | System | READY_OPENED |
| REJECTED | Admin rejected course | Coach (can resubmit) | PENDING_APPROVAL |
| READY_OPENED | Course ready for enrollment | System | FULL / CANCELLED |
| FULL | Max participants reached | System | READY_OPENED |
| CANCELLED | Coach cancelled course | Coach | - |

## Notification System

Coaches receive notifications when course status changes:

### Approval Notification
```
Title: "Course creation request approved"
Body: "Your course '${courseName}' has been approved."
Link: /coach/courses/${courseId}
Type: SUCCESS
```

### Rejection Notification
```
Title: "Course creation request rejected"
Body: "Your course '${courseName}' has been rejected."
Link: /coach/courses/${courseId}
Type: ERROR
```

## Error Scenarios

| Error | Condition | Response |
|-------|-----------|----------|
| Unauthorized | User not authenticated | 401 Unauthorized |
| Forbidden | User not admin | 403 Forbidden |
| Not Found | Course/request doesn't exist | 404 Not Found |
| Bad Request | Request already processed | 400 Bad Request |
| Bad Request | Course has no sessions | 400 Bad Request |

## Transaction Safety

Both approve and reject use database transactions to ensure:
- All updates complete together
- No partial state if operation fails
- Course and request status always consistent
- Action audit trail always recorded
- Notifications always sent after database updates

## Session Generation

On approval, the system generates sessions based on:
- Course start and end dates
- Provided schedules/recurrence patterns
- Lessons within the subject
- Videos and quizzes for each lesson

Each generated session:
- Links to original lesson content
- Creates new video record with READY status
- Creates new quiz record with copied questions
- Is assigned the corresponding lesson's content
