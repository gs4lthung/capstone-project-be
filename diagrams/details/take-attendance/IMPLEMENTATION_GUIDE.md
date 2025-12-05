# Take Attendance Feature - Implementation Guide

## Overview
The **Take Attendance** feature enables coaches to mark learner attendance after a session is completed. When a coach completes a session, they must record attendance for all enrolled learners. This feature:
- Records attendance status (PRESENT or ABSENT) for each learner
- Updates learner progress when marked PRESENT
- Handles wallet top-ups for coaches completing on time
- Updates course and enrollment status based on completion
- Sends notifications to learners

## API Endpoint

### Complete Session with Attendance
- **Method**: `PATCH`
- **Route**: `/api/v{version}/sessions/:id/complete`
- **Authentication**: Bearer token (required)
- **Authorization**: `UserRole.COACH` (only coaches can complete sessions)

## Request Body

```json
{
  "attendances": [
    {
      "userId": 1,
      "status": "PRESENT"
    },
    {
      "userId": 2,
      "status": "ABSENT"
    }
  ]
}
```

### CompleteSessionDto

```typescript
export class CompleteSessionDto {
  @ApiProperty({
    description: 'List of attendances for the session',
    example: [{ userId: 1, status: AttendanceStatus.PRESENT }],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateAttendanceDto)
  attendances: CreateAttendanceDto[];
}

export class CreateAttendanceDto {
  @ApiProperty({
    description: 'The ID of the user',
    type: Number,
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    description: 'The attendance status of the user',
    enum: AttendanceStatus,
  })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}
```

## Response

```json
{
  "statusCode": 200,
  "message": "Điểm danh và hoàn thành buổi học thành công, bạn đã nhận được 100000 vào ví của mình.",
  "data": null
}
```

Response message varies based on whether the coach completes within the allowed deadline:
- **On time**: "...bạn đã nhận được [amount] vào ví của mình."
- **Late**: "...nhưng buổi học đã hoàn thành quá thời gian quy định để nhận tiền."

## Database Entities

### Attendance Entity

```typescript
@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.attendances, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Session, (session) => session.attendances, {
    onDelete: 'CASCADE',
  })
  session: Session;
}
```

**Location**: `libs/database/src/entities/attendance.entity.ts`

### Session Entity

Key properties for this feature:
- `id: number` - Session identifier
- `status: SessionStatus` - Must be `SCHEDULED` to complete
- `scheduleDate: Date` - Date of the session
- `startTime: string` - Session start time (HH:MM:SS)
- `endTime: string` - Session end time (HH:MM:SS)
- `completedAt: Date` - When session was completed
- `attendances: Attendance[]` - Array of attendance records

**Location**: `libs/database/src/entities/session.entity.ts`

### Course Entity

Key properties:
- `id: number`
- `totalEarnings: number` - Total earnings for the course
- `totalSessions: number` - Total sessions in course
- `progressPct: number` - Course progress percentage (0-100)
- `status: CourseStatus` - Overall course status
- `enrollments: Enrollment[]` - Course enrollments

**Location**: `libs/database/src/entities/course.entity.ts`

### LearnerProgress Entity

```typescript
class LearnerProgress {
  id: number;
  course: Course;
  user: User;
  sessionsCompleted: number; // Incremented when learner marked PRESENT
  progressPct: number;
  updatedAt: Date;
}
```

**Location**: `libs/database/src/entities/learner-progress.entity.ts`

### SessionEarning Entity

```typescript
class SessionEarning {
  id: number;
  sessionPrice: number;
  coachEarningTotal: number;
  paidAt: Date;
  session: Session;
}
```

**Location**: `libs/database/src/entities/session-earning.entity.ts`

## Enums

### AttendanceStatus

```typescript
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
}
```

**Location**: `libs/shared/src/enums/attendance.enum.ts`

### SessionStatus

```typescript
export enum SessionStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
```

**Location**: `libs/shared/src/enums/session.enum.ts`

### EnrollmentStatus

```typescript
export enum EnrollmentStatus {
  PENDING_GROUP = 'PENDING_GROUP',
  CONFIRMED = 'CONFIRMED',
  LEARNING = 'LEARNING',
  UNPAID = 'UNPAID',
  CANCELLED = 'CANCELLED',
  DONE = 'DONE',
}
```

**Location**: `libs/shared/src/enums/enrollment.enum.ts`

## Implementation Steps

### 1. Validate Session (SessionService)

```typescript
const session = await manager.getRepository(Session).findOne({
  where: { id: id },
  relations: ['course'],
  withDeleted: false,
});

// Validate session exists
if (!session) throw new BadRequestException('Buổi học không tồn tại');

// Validate session status is SCHEDULED
if (session.status !== SessionStatus.SCHEDULED) {
  throw new BadRequestException('Buổi học chưa được lên lịch');
}

// Validate session is finished (using helper method)
if (this.getSessionTimeStatus(session) !== 'finished') {
  throw new BadRequestException('Buổi học chưa kết thúc');
}
```

### 2. Fetch Course with Enrollments

```typescript
const course = await manager.getRepository(Course).findOne({
  where: { id: session.course.id },
  relations: ['enrollments', 'enrollments.user'],
  withDeleted: false,
});
```

### 3. Validate Attendance Count

```typescript
const isCheckAllLearnerAttendance =
  data.attendances.length === course.enrollments.length;

if (!isCheckAllLearnerAttendance) {
  throw new BadRequestException(
    'Phải kiểm tra điểm danh cho tất cả học viên đã đăng ký',
  );
}
```

All enrolled learners must have an attendance record.

### 4. Calculate and Save Session Earning

```typescript
const sessionEarning = Number(course.totalEarnings) / course.totalSessions;

const sessionEarningRecord = manager
  .getRepository(SessionEarning)
  .create({
    sessionPrice: Number(sessionEarning),
    coachEarningTotal: Number(sessionEarning),
    paidAt: new Date(),
    session: session,
  });

await manager.getRepository(SessionEarning).save(sessionEarningRecord);
```

### 5. Update Session Status to COMPLETED

```typescript
await manager.getRepository(Session).update(id, {
  status: SessionStatus.COMPLETED,
  completedAt: new Date(),
});
```

### 6. Create Attendance Records

```typescript
for (const attendanceDto of data.attendances) {
  const attendance = manager.getRepository(Attendance).create({
    user: { id: attendanceDto.userId as User['id'] },
    session: session,
    status: attendanceDto.status,
  });
  await manager.getRepository(Attendance).save(attendance);
}
```

### 7. Update Learner Progress (if PRESENT)

```typescript
if (attendanceDto.status === AttendanceStatus.PRESENT) {
  const learnerProgress = await manager
    .getRepository(LearnerProgress)
    .findOne({
      where: {
        course: { id: course.id },
        user: { id: attendanceDto.userId as User['id'] },
      },
      relations: ['course', 'user'],
    });

  if (learnerProgress) {
    learnerProgress.sessionsCompleted += 1;
    await manager.getRepository(LearnerProgress).save(learnerProgress);
  }
}
```

### 8. Emit Achievement Event

```typescript
this.eventEmitter.emit('session.attended', {
  userId: attendanceDto.userId,
  sessionId: session.id,
  status: attendanceDto.status,
});
```

This event triggers achievement tracking logic.

### 9. Handle Wallet Top-Up

Check if session was completed within the allowed deadline:

```typescript
const completeBeforeHoursConfig =
  await this.configurationService.findByKey(
    'complete_session_before_hours',
  );
const hoursBefore = completeBeforeHoursConfig?.metadata?.value
  ? Number(completeBeforeHoursConfig.metadata.value)
  : 0;

const sessionEndTime = new Date(session.scheduleDate);
const [eh, em] = session.endTime.split(':').map(Number);
sessionEndTime.setHours(eh, em, 0, 0);
const deadlineTime = new Date(
  sessionEndTime.getTime() + hoursBefore * 60 * 60 * 1000,
);

if (new Date() <= deadlineTime) {
  await this.walletService.handleWalletTopUp(
    this.request.user.id as User['id'],
    sessionEarning,
  );
}
```

### 10. Update Course Progress

```typescript
const totalSessions = await manager.getRepository(Session).count({
  where: { course: { id: course.id } },
});
const completedSessions = await manager.getRepository(Session).count({
  where: {
    course: { id: course.id },
    status: SessionStatus.COMPLETED,
  },
});

const progressPct = Math.floor((completedSessions / totalSessions) * 100);
await manager.getRepository(Course).update(course.id, {
  progressPct: progressPct,
});

if (totalSessions === completedSessions) {
  await manager.getRepository(Course).update(course.id, {
    status: CourseStatus.COMPLETED,
  });
}
```

### 11. Update Enrollments

```typescript
for (const enrollment of course.enrollments) {
  if (completedSessions === totalSessions) {
    enrollment.status = EnrollmentStatus.DONE;
  }
  await manager.getRepository(Enrollment).save(enrollment);
}
```

### 12. Send Notifications to Learners

```typescript
for (const enrollment of course.enrollments) {
  await this.notificationService.sendNotification({
    userId: enrollment.user.id,
    title: 'Buổi học đã hoàn thành',
    body: `Buổi học ${session.name} của khóa học ${course.name} đã được hoàn thành.`,
    navigateTo: `/learner/courses/${course.id}/sessions/${session.id}`,
    type: NotificationType.SUCCESS,
  });
}
```

## Controller Implementation

```typescript
@Patch(':id/complete')
@HttpCode(HttpStatus.OK)
@ApiBearerAuth()
@ApiOperation({
  tags: ['Sessions'],
  summary: 'Complete a session',
  description: 'Complete a session with attendance records',
})
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Session completed successfully',
})
@CheckRoles(UserRole.COACH)
@UseGuards(AuthGuard, RoleGuard)
async completeSession(
  @Param('id') id: number,
  @Body() data: CompleteSessionDto,
) {
  return this.sessionService.completeAndCheckAttendance(id, data);
}
```

**Location**: `apps/api-gateway/src/controllers/session.controller.ts`

## Service Implementation

```typescript
async completeAndCheckAttendance(
  id: number,
  data: CompleteSessionDto,
): Promise<CustomApiResponse<void>> {
  return await this.datasource.transaction(async (manager) => {
    // 1. Validate session
    // 2. Fetch course with enrollments
    // 3. Validate attendance count
    // 4. Calculate and save session earning
    // 5. Update session status
    // 6. Create attendance records
    // 7. Update learner progress
    // 8. Emit events
    // 9. Handle wallet top-up
    // 10. Update course progress
    // 11. Update enrollments
    // 12. Send notifications
    // Return success response
  });
}
```

**Location**: `apps/api-gateway/src/services/session.service.ts`

## Helper Methods

### getSessionTimeStatus()

```typescript
public getSessionTimeStatus(
  session: Session,
): 'upcoming' | 'ongoing' | 'finished' | 'invalid' {
  // Validates session has required data
  // Parses session date/time in Vietnam timezone (UTC+7)
  // Compares with current time
  // Returns: 'upcoming', 'ongoing', 'finished', or 'invalid'
}
```

This method is crucial for validating that a session has actually finished before allowing attendance to be recorded.

## Key Business Logic

1. **Transaction Safety**: All operations use database transactions to ensure atomicity
2. **Attendance Validation**: All enrolled learners must have an attendance record
3. **Time Validation**: Session must be finished (based on local Vietnam time)
4. **Progress Tracking**: Only PRESENT attendance increments learner progress
5. **Deadline Handling**: Wallet top-up only occurs if coach completes within deadline
6. **Course Completion**: Course marked as COMPLETED when all sessions are completed
7. **Enrollment Status**: Set to DONE when course is fully completed
8. **Notifications**: Learners are notified when session completes

## Error Handling

- **'Buổi học không tồn tại'** - Session not found
- **'Buổi học chưa được lên lịch'** - Session status is not SCHEDULED
- **'Buổi học chưa kết thúc'** - Session has not finished yet
- **'Phải kiểm tra điểm danh cho tất cả học viên đã đăng ký'** - Attendance count mismatch
- **'Lỗi server'** - Internal server error (missing course, configuration, etc.)

## Testing Scenarios

### Scenario 1: Complete Session with All PRESENT
1. Coach calls `/sessions/:id/complete` with all learners marked PRESENT
2. Verify all Attendance records created with PRESENT status
3. Verify LearnerProgress.sessionsCompleted incremented for each
4. Verify SessionEarning created
5. Verify wallet top-up if within deadline
6. Verify notifications sent

### Scenario 2: Complete Session with Mixed Attendance
1. Coach marks some learners PRESENT, others ABSENT
2. Verify Attendance records created correctly
3. Verify LearnerProgress only incremented for PRESENT learners
4. Verify wallet still top-up (if on time)

### Scenario 3: Session Completion After Deadline
1. Coach completes session after deadline expires
2. Verify Attendance recorded
3. Verify wallet NOT topped up
4. Verify error message includes "quá thời gian quy định"

### Scenario 4: Incomplete Attendance Records
1. Coach tries to complete without providing attendance for all
2. Verify BadRequestException: "Phải kiểm tra điểm danh cho tất cả học viên"

### Scenario 5: Complete Course
1. Complete final session of a course
2. Verify Course.status set to COMPLETED
3. Verify all Enrollment.status set to DONE
4. Verify progressPct = 100

## Related Features
- **View Session Calendar**: Coaches can view scheduled sessions
- **Manage Course**: Coaches create courses with sessions
- **Learner Progress Tracking**: Track learner completion across sessions
- **Wallet Management**: Coach earnings from completed sessions
