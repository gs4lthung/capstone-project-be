# Feature: Manage Achievement (CRUD)

- Controller: `AchievementController.findAll(pagination, filter)`, `AchievementController.findOne(id)`, `AchievementController.createEventCount(data, icon)`, `AchievementController.createStreak(data, icon)`, `AchievementController.createPropertyCheck(data, icon)`, `AchievementController.updateEventCount(id, data, icon)`, `AchievementController.updateStreak(id, data, icon)`, `AchievementController.updatePropertyCheck(id, data, icon)`, `AchievementController.delete(id)`, `AchievementController.activate(id)`, `AchievementController.deactivate(id)`
- Service: `AchievementService.findAll(findOptions)`, `AchievementService.findOne(id)`, `AchievementService.createEventCount(data, icon)`, `AchievementService.createStreak(data, icon)`, `AchievementService.createPropertyCheck(data, icon)`, `AchievementService.updateEventCount(id, data, icon)`, `AchievementService.updateStreak(id, data, icon)`, `AchievementService.updatePropertyCheck(id, data, icon)`, `AchievementService.delete(id)`, `AchievementService.activate(id)`, `AchievementService.deactivate(id)`
- Entities: `Achievement`, `EventCountAchievement`, `StreakAchievement`, `PropertyCheckAchievement`, `LearnerProgress`, `User`
- Utilities: `AuthGuard`, `RoleGuard`, `BunnyService`, `DataSource`

Scope rules:
- Admin-only feature with role guard
- Three achievement types: EVENT_COUNT, STREAK, PROPERTY_CHECK
- Include icon upload via BunnyService
- Show activate/deactivate and soft delete
- No note blocks in class diagram; use inline method calls in sequences

## Class: AchievementController

```csv
Class,No,Method,Description
"AchievementController",01,"findAll(pagination, filter): Promise<PaginateObject<Achievement>>","Retrieves all achievements with pagination and filtering (Admin only AuthGuard + RoleGuard)"
"AchievementController",02,"findOne(id: number): Promise<Achievement>","Retrieves single achievement by ID with relations (Admin only AuthGuard + RoleGuard)"
"AchievementController",03,"createEventCount(data: CreateEventCountAchievementDto, icon?: File): Promise<CustomApiResponse>","Creates EVENT_COUNT achievement; uploads icon to Bunny if provided (Admin only AuthGuard + RoleGuard)"
"AchievementController",04,"createStreak(data: CreateStreakAchievementDto, icon?: File): Promise<CustomApiResponse>","Creates STREAK achievement; uploads icon to Bunny if provided (Admin only AuthGuard + RoleGuard)"
"AchievementController",05,"createPropertyCheck(data: CreatePropertyCheckAchievementDto, icon?: File): Promise<CustomApiResponse>","Creates PROPERTY_CHECK achievement; uploads icon to Bunny if provided (Admin only AuthGuard + RoleGuard)"
"AchievementController",06,"updateEventCount(id: number, data: UpdateEventCountAchievementDto, icon?: File): Promise<CustomApiResponse>","Updates EVENT_COUNT achievement; uploads new icon if provided (Admin only AuthGuard + RoleGuard)"
"AchievementController",07,"updateStreak(id: number, data: UpdateStreakAchievementDto, icon?: File): Promise<CustomApiResponse>","Updates STREAK achievement; uploads new icon if provided (Admin only AuthGuard + RoleGuard)"
"AchievementController",08,"updatePropertyCheck(id: number, data: UpdatePropertyCheckAchievementDto, icon?: File): Promise<CustomApiResponse>","Updates PROPERTY_CHECK achievement; uploads new icon if provided (Admin only AuthGuard + RoleGuard)"
"AchievementController",09,"delete(id: number): Promise<CustomApiResponse>","Soft deletes achievement by setting deletedAt (Admin only AuthGuard + RoleGuard)"
"AchievementController",10,"activate(id: number): Promise<CustomApiResponse>","Sets achievement isActive to true (Admin only AuthGuard + RoleGuard)"
"AchievementController",11,"deactivate(id: number): Promise<CustomApiResponse>","Sets achievement isActive to false (Admin only AuthGuard + RoleGuard)"
```

## Class: AchievementService

```csv
Class,No,Method,Description
"AchievementService",01,"findAll(findOptions): Promise<PaginateObject<Achievement>>","Retrieves paginated list of achievements with filtering using base TypeORM helper"
"AchievementService",02,"findOne(id): Promise<Achievement>","Retrieves achievement by ID with relations; throws if not found"
"AchievementService",03,"createEventCount(data, icon?): Promise<CustomApiResponse>","Uploads icon to BunnyService if provided; creates EventCountAchievement with name description eventName targetCount"
"AchievementService",04,"createStreak(data, icon?): Promise<CustomApiResponse>","Uploads icon to BunnyService if provided; creates StreakAchievement with name description eventName targetStreakLength streakUnit"
"AchievementService",05,"createPropertyCheck(data, icon?): Promise<CustomApiResponse>","Uploads icon to BunnyService if provided; creates PropertyCheckAchievement with name description eventName entityName propertyName comparisonOperator targetValue"
"AchievementService",06,"updateEventCount(id, data, icon?): Promise<CustomApiResponse>","Finds achievement; uploads new icon if provided; updates fields; saves achievement"
"AchievementService",07,"updateStreak(id, data, icon?): Promise<CustomApiResponse>","Finds achievement; uploads new icon if provided; updates fields; saves achievement"
"AchievementService",08,"updatePropertyCheck(id, data, icon?): Promise<CustomApiResponse>","Finds achievement; uploads new icon if provided; updates fields; saves achievement"
"AchievementService",09,"delete(id): Promise<CustomApiResponse>","Soft deletes achievement by setting deletedAt timestamp"
"AchievementService",10,"activate(id): Promise<CustomApiResponse>","Finds achievement; sets isActive = true; saves achievement"
"AchievementService",11,"deactivate(id): Promise<CustomApiResponse>","Finds achievement; sets isActive = false; saves achievement"
```

## Class: AuthGuard

```csv
Class,No,Method,Description
"AuthGuard",01,"canActivate(context): boolean","Validates JWT token and authenticates user"
```

## Class: RoleGuard

```csv
Class,No,Method,Description
"RoleGuard",01,"canActivate(context): boolean","Checks if authenticated user has required role (ADMIN)"
```

## Class: BunnyService

```csv
Class,No,Method,Description
"BunnyService",01,"uploadToStorage(file): Promise<string>","Uploads icon file to Bunny CDN; returns iconUrl"
```

## Class: AchievementRepository

```csv
Class,No,Method,Description
"AchievementRepository",01,"find(findOptions): Promise<[Achievement[], number]>","TypeORM repository: queries achievements with pagination/filtering"
"AchievementRepository",02,"findOne(id): Promise<Achievement>","TypeORM repository: finds achievement by ID"
"AchievementRepository",03,"create(data): Promise<Achievement>","TypeORM repository: creates new achievement record"
"AchievementRepository",04,"update(id, data): Promise<Achievement>","TypeORM repository: updates achievement fields"
"AchievementRepository",05,"softDelete(id): Promise<void>","TypeORM repository: soft deletes achievement"
```

## Class: LearnerProgressRepository

```csv
Class,No,Method,Description
"LearnerProgressRepository",01,"find(options): Promise<LearnerProgress[]>","TypeORM repository: queries learner progress records"
```

## Class: Achievement

```csv
Class,No,Method,Description
"Achievement",-,"None","Base entity for achievements with id name description iconUrl isActive createdAt createdBy"
```

## Class: EventCountAchievement

```csv
Class,No,Method,Description
"EventCountAchievement",-,"None","Achievement type tracking event count with eventName targetCount"
```

## Class: StreakAchievement

```csv
Class,No,Method,Description
"StreakAchievement",-,"None","Achievement type tracking consecutive events with eventName targetStreakLength streakUnit"
```

## Class: PropertyCheckAchievement

```csv
Class,No,Method,Description
"PropertyCheckAchievement",-,"None","Achievement type checking entity property with eventName entityName propertyName comparisonOperator targetValue"
```

## Class: LearnerProgress

```csv
Class,No,Method,Description
"LearnerProgress",-,"None","Entity tracking learner progress toward achievements with currentCount earnedAt"
```

## Class: User

```csv
Class,No,Method,Description
"User",-,"None","Entity representing platform user (admin creating achievements)"
```

## Class: CreateEventCountAchievementDto

```csv
Class,No,Method,Description
"CreateEventCountAchievementDto",-,"None","DTO carrying name description eventName targetCount isActive for creating EVENT_COUNT achievement"
```

## Class: CreateStreakAchievementDto

```csv
Class,No,Method,Description
"CreateStreakAchievementDto",-,"None","DTO carrying name description eventName targetStreakLength streakUnit isActive for creating STREAK achievement"
```

## Class: CreatePropertyCheckAchievementDto

```csv
Class,No,Method,Description
"CreatePropertyCheckAchievementDto",-,"None","DTO carrying name description eventName entityName propertyName comparisonOperator targetValue isActive for creating PROPERTY_CHECK achievement"
```

## Class: UpdateEventCountAchievementDto

```csv
Class,No,Method,Description
"UpdateEventCountAchievementDto",-,"None","DTO carrying optional fields for updating EVENT_COUNT achievement"
```

## Class: UpdateStreakAchievementDto

```csv
Class,No,Method,Description
"UpdateStreakAchievementDto",-,"None","DTO carrying optional fields for updating STREAK achievement"
```

## Class: UpdatePropertyCheckAchievementDto

```csv
Class,No,Method,Description
"UpdatePropertyCheckAchievementDto",-,"None","DTO carrying optional fields for updating PROPERTY_CHECK achievement"
```

