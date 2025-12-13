# Feature: Manage Course

- Controller: `CourseController.findAll(pagination, sort, filter)`, `CourseController.findOne(id)`, `CourseController.getAvailableCourses(page, size, name, level, province, district)`, `CourseController.getCoursesForCoach(page, size)`, `CourseController.getCoursesForLearner(page, size)`, `CourseController.createCourse(subjectId, data, file)`, `CourseController.updateCourseCreationRequest(id, data, file)`, `CourseController.approveCourseCreationRequest(id)`, `CourseController.rejectCourseCreationRequest(id, reason)`
- Service: `CourseService.findAll(findOptions)`, `CourseService.findOne(id)`, `CourseService.findAvailableCourses(page, size, name, level, province, district)`, `CourseService.findCoachCourses(page, size)`, `CourseService.findLearnerCourses(page, size)`, `CourseService.createCourseCreationRequest(subjectId, data, file)`, `CourseService.updateCourseCreationRequest(id, data, file)`, `CourseService.approveCourseCreationRequest(id)`, `CourseService.rejectCourseCreationRequest(id, reason)`
- Entities: `Course`, `Schedule`, `Session`, `User`, `Subject`, `Court`, `Request`, `RequestAction`, `Enrollment`
- Utilities: `AuthGuard`, `RoleGuard`, `ScheduleService`, `SessionService`, `NotificationService`, `ConfigurationService`, `BunnyService`, `DataSource`

Scope rules:
- Coach can create/update course creation requests (PENDING_APPROVAL)
- Admin can approve/reject course creation requests
- Public can view available courses; Coach can view their courses; Learner can view enrolled courses
- Include guards for authentication and authorization
- Show repository pattern with TypeORM
- Track request status changes with RequestAction
- No note blocks in class diagram; use inline method calls in sequences

## Class: CourseController

```csv
Class,No,Method,Description
"CourseController",01,"findAll(pagination, sort, filter): Promise<PaginateObject<Course>>","Retrieves all courses with pagination sorting and filtering"
"CourseController",02,"findOne(id: number): Promise<Course>","Retrieves single course by ID with full relations (sessions quiz video enrollments subject schedules court)"
"CourseController",03,"getAvailableCourses(page, size, name?, level?, province?, district?): Promise<PaginateObject<Course>>","Public endpoint: retrieves available courses (APPROVED READY_OPENED FULL) with optional filters"
"CourseController",04,"getCoursesForCoach(page, size): Promise<PaginateObject<Course>>","Coach-only: retrieves courses created by authenticated coach (AuthGuard)"
"CourseController",05,"getCoursesForLearner(page, size): Promise<PaginateObject<Course>>","Learner-only: retrieves courses where authenticated user is enrolled (AuthGuard)"
"CourseController",06,"createCourse(subjectId, data: CreateCourseRequestDto, file?): Promise<CustomApiResponse>","Coach creates course creation request; validates subject schedules court (Coach only AuthGuard + RoleGuard)"
"CourseController",07,"updateCourseCreationRequest(id, data: UpdateCourseDto, file?): Promise<CustomApiResponse>","Coach updates PENDING_APPROVAL request; validates ownership (Coach only AuthGuard + RoleGuard)"
"CourseController",08,"approveCourseCreationRequest(id): Promise<CustomApiResponse>","Admin approves request; creates Course with schedules and sessions (Admin only AuthGuard + RoleGuard)"
"CourseController",09,"rejectCourseCreationRequest(id, reason: string): Promise<CustomApiResponse>","Admin rejects request with reason; sends notification (Admin only AuthGuard + RoleGuard)"
```

## Class: CourseService

```csv
Class,No,Method,Description
"CourseService",01,"findAll(findOptions): Promise<PaginateObject<Course>>","Retrieves paginated list of courses using base TypeORM helper"
"CourseService",02,"findOne(id): Promise<Course>","Retrieves course with full relations in transaction (sessions quiz video enrollments user subject schedules court province district)"
"CourseService",03,"findAvailableCourses(page, size, name?, level?, province?, district?): Promise<PaginateObject<Course>>","Retrieves courses where status IN (APPROVED READY_OPENED FULL) with optional name/level/location filters"
"CourseService",04,"findCoachCourses(page, size): Promise<PaginateObject<Course>>","Retrieves courses WHERE createdBy = userId with schedules and court relations"
"CourseService",05,"findLearnerCourses(page, size): Promise<PaginateObject<Course>>","Retrieves courses WHERE enrollment.user = userId AND enrollment.status IN (CONFIRMED LEARNING PENDING_GROUP DONE UNPAID)"
"CourseService",06,"createCourseCreationRequest(subjectId, data, file?): Promise<CustomApiResponse>","Validates: court exists schedules no overlaps startDate >= configMinDays subject PUBLISHED with lessons having video+quiz scheduleCount <= lessonCount lessonCount divisible by scheduleCount no schedule conflicts; uploads file to Bunny; creates Request with metadata; notifies admin"
"CourseService",07,"updateCourseCreationRequest(id, data, file?): Promise<CustomApiResponse>","Finds PENDING_APPROVAL request; validates ownership; validates court/schedules/startDate if provided; uploads file to Bunny; merges metadata; updates request"
"CourseService",08,"approveCourseCreationRequest(id): Promise<CustomApiResponse>","Finds PENDING_APPROVAL request; extracts metadata; creates Course with status=APPROVED; creates schedules via ScheduleService; generates sessions via SessionService; updates request status=APPROVED; creates RequestAction type=APPROVED; notifies coach"
"CourseService",09,"rejectCourseCreationRequest(id, reason): Promise<CustomApiResponse>","Finds PENDING_APPROVAL request; updates status=REJECTED with rejectionReason; creates RequestAction type=REJECTED; notifies coach with reason"
```

## Class: AuthGuard

```csv
Class,No,Method,Description
"AuthGuard",01,"canActivate(context): boolean","Validates JWT token and authenticates user"
```

## Class: RoleGuard

```csv
Class,No,Method,Description
"RoleGuard",01,"canActivate(context): boolean","Checks if authenticated user has required role (COACH or ADMIN)"
```

## Class: ScheduleService

```csv
Class,No,Method,Description
"ScheduleService",01,"createSchedules(course, schedules): Promise<Schedule[]>","Creates schedule records for given course"
"ScheduleService",02,"checkScheduleConflicts(coachId, schedules, startDate): Promise<boolean>","Validates coach doesn't have overlapping schedules at given times"
```

## Class: SessionService

```csv
Class,No,Method,Description
"SessionService",01,"generateSessionsFromSchedule(course): Promise<Session[]>","Generates session records based on course schedules startDate endDate and lesson count"
```

## Class: NotificationService

```csv
Class,No,Method,Description
"NotificationService",01,"sendNotification(data): Promise<void>","Sends notification to specific user (admin or coach)"
```

## Class: ConfigurationService

```csv
Class,No,Method,Description
"ConfigurationService",01,"getMinDaysBeforeCourseStart(): Promise<number>","Retrieves configuration value for minimum days before course start date"
```

## Class: BunnyService

```csv
Class,No,Method,Description
"BunnyService",01,"uploadToStorage(file): Promise<string>","Uploads file to Bunny CDN; returns publicUrl"
```

## Class: CourseRepository

```csv
Class,No,Method,Description
"CourseRepository",01,"find(findOptions): Promise<[Course[], number]>","TypeORM repository: queries courses with pagination/sorting/filtering"
"CourseRepository",02,"findOne(id, relations): Promise<Course>","TypeORM repository: queries single course with specified relations"
"CourseRepository",03,"create(courseData): Promise<Course>","TypeORM repository: creates new course record"
```

## Class: RequestRepository

```csv
Class,No,Method,Description
"RequestRepository",01,"findOne(id, options): Promise<Request>","TypeORM repository: finds request with optional relations and filters"
"RequestRepository",02,"create(requestData): Promise<Request>","TypeORM repository: creates new request record (type=COURSE_CREATION status=PENDING_APPROVAL)"
"RequestRepository",03,"update(id, data): Promise<Request>","TypeORM repository: updates request status metadata rejectionReason processedAt"
```

## Class: RequestActionRepository

```csv
Class,No,Method,Description
"RequestActionRepository",01,"create(actionData): Promise<RequestAction>","TypeORM repository: creates request action record (type=APPROVED or REJECTED with reason)"
```

## Class: SubjectRepository

```csv
Class,No,Method,Description
"SubjectRepository",01,"findOne(id, options): Promise<Subject>","TypeORM repository: finds subject with lessons relation"
```

## Class: CourtRepository

```csv
Class,No,Method,Description
"CourtRepository",01,"findOne(id): Promise<Court>","TypeORM repository: finds court by ID"
```

## Class: ScheduleRepository

```csv
Class,No,Method,Description
"ScheduleRepository",01,"insert(schedules): Promise<Schedule[]>","TypeORM repository: bulk inserts schedule records"
```

## Class: Course

```csv
Class,No,Method,Description
"Course",-,"None","Entity representing course with status level learningFormat dates participants price publicUrl googleMeetLink"
```

## Class: Schedule

```csv
Class,No,Method,Description
"Schedule",-,"None","Entity representing course schedule with dayOfWeek startTime endTime totalSessions"
```

## Class: Session

```csv
Class,No,Method,Description
"Session",-,"None","Entity representing course session with sessionNumber scheduleDate times status quiz video"
```

## Class: User

```csv
Class,No,Method,Description
"User",-,"None","Entity representing platform user (coach learner or admin)"
```

## Class: Subject

```csv
Class,No,Method,Description
"Subject",-,"None","Entity representing pickleball subject with lessons; must be PUBLISHED for course creation"
```

## Class: Court

```csv
Class,No,Method,Description
"Court",-,"None","Entity representing pickleball court location with address pricing province district"
```

## Class: Request

```csv
Class,No,Method,Description
"Request",-,"None","Entity representing approval request with type metadata status rejectionReason processedAt"
```

## Class: RequestAction

```csv
Class,No,Method,Description
"RequestAction",-,"None","Entity representing action taken on request (APPROVED or REJECTED) with actionBy and reason"
```

## Class: Enrollment

```csv
Class,No,Method,Description
"Enrollment",-,"None","Entity representing learner enrollment in course with status paymentAmount enrolledAt"
```

## Class: CreateCourseRequestDto

```csv
Class,No,Method,Description
"CreateCourseRequestDto",-,"None","DTO carrying name description level learningFormat startDate minParticipants maxParticipants pricePerParticipant schedules courtId"
```

## Class: UpdateCourseDto

```csv
Class,No,Method,Description
"UpdateCourseDto",-,"None","DTO carrying optional fields for updating course creation request"
```

## Class: RejectCourseDto

```csv
Class,No,Method,Description
"RejectCourseDto",-,"None","DTO carrying reason for rejecting course creation request"
```

