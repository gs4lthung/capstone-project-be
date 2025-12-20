# Feature: View Session Calendar

## Controllers

| Class | No | Method | Description |
|-------|----|--------------------|-------------|

### SessionController

| No | Method | Description |
|----|--------|-------------|
| 1 | getSessionsByCourseId(courseId) | Get all sessions by course ID (COACH/LEARNER) |
| 2 | getSessionById(id) | Get single session details by ID (COACH/LEARNER) |
| 3 | getWeeklyCalendarSessions(data) | Get weekly calendar sessions for authenticated user (COACH/LEARNER) |
| 4 | completeSession(id, data) | Complete session and take attendance (COACH only) |

### AttendanceController

| No | Method | Description |
|----|--------|-------------|
| 1 | coachGetLearnerAttendance(sessionId, learnerId) | Get learner attendance for specific session |

## Services

### SessionService

| No | Method | Description |
|----|--------|-------------|
| 1 | findByCourseId(courseId) | Query all sessions by course ID with relations |
| 2 | findOne(id) | Find single session by ID with relations (course, schedule, attendances, enrollments) |
| 3 | getSessionsForWeeklyCalendar(data) | Get sessions for weekly calendar view filtered by date range and user |
| 4 | completeSession(id, data) | Transaction: verify ownership, validate status, create attendance records, update progress, create earnings |

### AttendanceService

| No | Method | Description |
|----|--------|-------------|
| 1 | getLearnerAttendance(sessionId, learnerId) | Transaction: find attendance record for learner in specific session |

## Guards

### AuthGuard
Validates JWT token from request headers for all session and attendance endpoints.

### RoleGuard
Checks user role (COACH/LEARNER for viewing, COACH only for completing sessions) based on endpoint requirements.

## Entities

### Session
Represents a session in a course schedule. Properties: id, name, description, sessionNumber, scheduleDate, startTime, endTime, durationInMinutes, status (PENDING/SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED), course (Course), schedule (Schedule), attendances (Attendance[]), enrollments (Enrollment[]).

### Attendance
Represents learner attendance for a session. Properties: id, attendanceStatus (PRESENT/ABSENT/EXCUSED), session (Session), user (User), createdAt, updatedAt.

### Course
Represents a course containing sessions. Properties: id, name, description, startDate, endDate, level, learningFormat, status, sessions (Session[]), schedules (Schedule[]), createdBy (User).

### Schedule
Represents recurring schedule template for course. Properties: id, dayOfWeek, startTime, endTime, course (Course), sessions (Session[]).

### Enrollment
Represents learner enrollment in course. Properties: id, course (Course), learner (User), status, enrolledAt.

### User
Represents coach or learner. Properties: id, fullName, email, role.

### LearnerProgress
Tracks learner progress in course. Properties: id, enrollment (Enrollment), sessionsCompleted, lastSessionDate.

### SessionEarning
Records coach earnings from completed session. Properties: id, session (Session), coach (User), amount, createdAt.

## DTOs

### CompleteSessionDto
Input for completing session. Fields: attendances (array of {learnerId, status}).

### GetSessionForWeeklyCalendarRequestDto
Input for weekly calendar query. Fields: startDate (Date), endDate (Date), userId? (number).

## Scope Rules

- **View Access**: Both COACH and LEARNER can view sessions and session details
- **Complete Session**: Only COACH can complete session (course creator verification required)
- **Attendance Creation**: When completing session, attendance records created for all enrolled learners
- **Progress Update**: PRESENT attendance increments LearnerProgress.sessionsCompleted
- **Session Status**: Only SCHEDULED sessions can be completed, updates to COMPLETED
- **Earnings**: SessionEarning record created for coach when session completed
- **Validation**: Attendance count must match course enrollments count
- **Achievement Check**: Completing sessions may trigger achievement progress checks
- **Weekly Calendar**: Filters sessions by date range and optionally by user ID
- **Relations**: Sessions loaded with course, schedule, attendances, and enrollments for complete view
