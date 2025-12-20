# Feature: Verify Coach

- Controller: `CoachController.findAll(pagination, sort, filter)`, `CoachController.findOne(id, isUser)`, `CoachController.verify(id)`, `CoachController.reject(id, body)`
- Service: `CoachService.findAll(findOptions)`, `CoachService.findOne(id, isUser)`, `CoachService.verifyCoach(coachId)`, `CoachService.rejectCoach(coachId, reason?)`
- Entities: `Coach`, `Credential`, `User`, `Role`
- Utilities: `AuthGuard`, `RoleGuard`, `NotificationService`, `DataSource`

Scope rules:
- Admin-only feature with role guard
- Include approve/reject flows with notification
- Show authentication and authorization flow
- Track verification status changes
- No note blocks; use inline method calls

## Class: CoachController

```csv
Class,No,Method,Description
"CoachController",01,"findAll(pagination, sort, filter): Promise<PaginateObject<Coach>>","Retrieves all coaches with pagination and filtering"
"CoachController",02,"findOne(id: number, isUser: boolean): Promise<Coach>","Retrieves a single coach by ID with relations"
"CoachController",03,"verify(id: number): Promise<{message: string}>","Admin verifies coach profile; sets status to VERIFIED (Admin only)"
"CoachController",04,"reject(id: number, body: RejectCoachDto): Promise<{message: string}>","Admin rejects coach profile with optional reason (Admin only)"
```

## Class: CoachService

```csv
Class,No,Method,Description
"CoachService",01,"findAll(findOptions: FindOptions): Promise<PaginateObject<Coach>>","Retrieves paginated list of coaches"
"CoachService",02,"findOne(id: number, isUser: boolean): Promise<Coach>","Retrieves coach with user credentials and baseCredential relations"
"CoachService",03,"verifyCoach(coachId: number): Promise<CustomApiResponse<void>>","Sets coach verificationStatus to VERIFIED; activates user if inactive; sends success notification"
"CoachService",04,"rejectCoach(coachId: number, reason?: string): Promise<CustomApiResponse<void>>","Sets coach verificationStatus to REJECTED; sends notification with reason"
```

## Class: AuthGuard

```csv
Class,No,Method,Description
"AuthGuard",01,"canActivate(context): boolean","Validates JWT token and authenticates user"
```

## Class: RoleGuard

```csv
Class,No,Method,Description
"RoleGuard",01,"canActivate(context): boolean","Checks if user has required role (ADMIN)"
```

## Class: NotificationService

```csv
Class,No,Method,Description
"NotificationService",01,"sendNotification(data): Promise<void>","Sends notification to specific user"
```

## Class: Coach

```csv
Class,No,Method,Description
"Coach",-,"None","Entity representing coach profile with verificationStatus bio specialties credentials"
```

## Class: Credential

```csv
Class,No,Method,Description
"Credential",-,"None","Entity representing coach credentials with baseCredential publicUrl dates"
```

## Class: User

```csv
Class,No,Method,Description
"User",-,"None","Entity representing platform user with isActive flag"
```

## Class: Role

```csv
Class,No,Method,Description
"Role",-,"None","Entity representing user role (ADMIN)"
```

## Class: RejectCoachDto

```csv
Class,No,Method,Description
"RejectCoachDto",-,"None","DTO carrying reason? for rejection"
```
