# Feature: Manage Subject

- Controller: `SubjectController.findAll(pagination, sort, filter)`, `SubjectController.findOne(id)`, `SubjectController.create(data, file)`, `SubjectController.update(id, data)`, `SubjectController.delete(id)`, `SubjectController.restore(id)`, `AiSubjectGenerationController.findAll(pagination, sort, filter)`, `AiSubjectGenerationController.findOne(id)`, `AiSubjectGenerationController.create(prompt)`, `AiSubjectGenerationController.useGeneratedSubject(id)`, `AiSubjectGenerationController.update(id, data)`, `AiSubjectGenerationController.delete(id)`
- Service: `SubjectService.findAll(findOptions)`, `SubjectService.findOne(id)`, `SubjectService.create(data, file)`, `SubjectService.update(id, data)`, `SubjectService.delete(id)`, `SubjectService.restore(id)`, `AiSubjectGenerationService.findAll(findOptions)`, `AiSubjectGenerationService.findOne(id)`, `AiSubjectGenerationService.create(prompt)`, `AiSubjectGenerationService.saveNewSubject(id)`, `AiSubjectGenerationService.update(id, data)`, `AiSubjectGenerationService.delete(id)`
- Entities: `Subject`, `User`, `Lesson`, `AiSubjectGeneration`
- Utilities: `AuthGuard`, `RoleGuard`, `BunnyService`, `AiGeminiService`, `DataSource`

Scope rules:
- Coach can create/update/delete/restore their own subjects
- Coach can generate subjects using AI with text prompts
- AI-generated subjects are saved as PENDING; coach can review/edit before using
- All operations require authentication (AuthGuard) and COACH role (RoleGuard)
- Subjects start with status DRAFT; can only publish if all lessons have video and quiz
- Delete is soft delete (sets deletedAt timestamp)
- Only subject owner can update/delete/restore
- Only AI generation owner can view/edit/use/delete their AI generations
- Use DataSource for database operations (no individual repositories in sequences)

## Class: SubjectController

```csv
Class,No,Method,Description
"SubjectController",01,"findAll(pagination, sort, filter): Promise<PaginatedResponse<Subject>>","Retrieves all subjects with pagination sorting and filtering (Coach only AuthGuard + RoleGuard)"
"SubjectController",02,"findOne(id: number): Promise<Subject>","Retrieves single subject by ID with relations (lessons) (Coach only AuthGuard + RoleGuard)"
"SubjectController",03,"create(data: CreateSubjectDto, file?): Promise<Response>","Coach creates subject with optional icon upload; status defaults to DRAFT (Coach only AuthGuard + RoleGuard)"
"SubjectController",04,"update(id: number, data: UpdateSubjectDto): Promise<Response>","Coach updates subject; validates ownership; validates lessons if publishing (Coach only AuthGuard + RoleGuard)"
"SubjectController",05,"delete(id: number): Promise<Response>","Coach soft deletes subject; validates ownership (Coach only AuthGuard + RoleGuard)"
"SubjectController",06,"restore(id: number): Promise<Response>","Coach restores soft-deleted subject; validates ownership (Coach only AuthGuard + RoleGuard)"
```

## Class: SubjectService

```csv
Class,No,Method,Description
"SubjectService",01,"findAll(findOptions): Promise<PaginatedResponse<Subject>>","Retrieves paginated list of subjects from DataSource with optional filters"
"SubjectService",02,"findOne(id): Promise<Subject>","Retrieves subject with lessons relation from DataSource"
"SubjectService",03,"create(data, file?): Promise<Response>","Uploads icon to Bunny if provided; inserts subject into DataSource with status=DRAFT and createdBy=currentUser"
"SubjectService",04,"update(id, data): Promise<Response>","Selects subject with lessons from DataSource; validates ownership (createdBy == currentUser); if status changing to PUBLISHED validates all lessons have video and quiz; updates subject in DataSource"
"SubjectService",05,"delete(id): Promise<Response>","Selects subject from DataSource; validates ownership (createdBy == currentUser); updates subject SET deletedAt=NOW() in DataSource"
"SubjectService",06,"restore(id): Promise<Response>","Selects deleted subject (withDeleted=true) from DataSource; validates ownership (createdBy == currentUser); updates subject SET deletedAt=NULL in DataSource"
```

## Class: AiSubjectGenerationController

```csv
Class,No,Method,Description
"AiSubjectGenerationController",01,"findAll(pagination, sort, filter): Promise<PaginatedResponse<AiSubjectGeneration>>","Retrieves all AI subject generations with pagination sorting and filtering (Coach only AuthGuard)"
"AiSubjectGenerationController",02,"findOne(id: number): Promise<AiSubjectGeneration>","Retrieves single AI generation by ID; validates ownership (Coach only AuthGuard)"
"AiSubjectGenerationController",03,"create(prompt: string): Promise<AiSubjectGeneration>","Coach generates subject using AI with text prompt (Coach only AuthGuard)"
"AiSubjectGenerationController",04,"useGeneratedSubject(id: number): Promise<Response>","Coach saves AI-generated subject as actual Subject entity with status=DRAFT (Coach only AuthGuard)"
"AiSubjectGenerationController",05,"update(id: number, data: UpdateAiGeneratedSubjectDto): Promise<Response>","Coach updates PENDING AI generation; validates ownership and PENDING status (Coach only AuthGuard)"
"AiSubjectGenerationController",06,"delete(id: number): Promise<Response>","Coach soft deletes AI generation; validates ownership (Coach only AuthGuard)"
```

## Class: AiSubjectGenerationService

```csv
Class,No,Method,Description
"AiSubjectGenerationService",01,"findAll(findOptions): Promise<PaginatedResponse<AiSubjectGeneration>>","Retrieves paginated list of AI generations from DataSource with optional filters"
"AiSubjectGenerationService",02,"findOne(id): Promise<AiSubjectGeneration>","Retrieves AI generation with requestedBy relation from DataSource; validates ownership (requestedBy == currentUser)"
"AiSubjectGenerationService",03,"create(prompt): Promise<AiSubjectGeneration>","Calls AiGeminiService.generateSubjectFromPrompt; creates AiSubjectGeneration with status=PENDING and generatedData from AI response; saves to DataSource"
"AiSubjectGenerationService",04,"saveNewSubject(id): Promise<Response>","Selects AI generation from DataSource; validates ownership and not USED; creates Subject entity with isAIGenerated=true lessons from generatedData status=DRAFT; updates AI generation status=USED and links createdSubject; all in transaction"
"AiSubjectGenerationService",05,"update(id, data): Promise<Response>","Selects AI generation from DataSource; validates ownership status=PENDING (not USED); validates quiz questions have exactly 1 correct answer; updates generatedData with new name description level lessons; saves to DataSource"
"AiSubjectGenerationService",06,"delete(id): Promise<Response>","Selects AI generation from DataSource; validates ownership; soft deletes in DataSource"
```

## Class: AuthGuard

```csv
Class,No,Method,Description
"AuthGuard",01,"canActivate(context): boolean","Validates JWT token and authenticates user"
```

## Class: RoleGuard

```csv
Class,No,Method,Description
"RoleGuard",01,"canActivate(context): boolean","Checks if authenticated user has COACH role"
```

## Class: BunnyService

```csv
Class,No,Method,Description
"BunnyService",01,"uploadToStorage(file): Promise<string>","Uploads file to Bunny CDN; returns publicUrl"
```

## Class: AiGeminiService

```csv
Class,No,Method,Description
"AiGeminiService",01,"generateSubjectFromPrompt(prompt): Promise<AiSubjectGenerationResponse>","Calls Gemini API with prompt and AiSubjectGenerationSchema; parses JSON response; validates structure; returns generated subject with name description level and lessons (each with video and quiz)"
```

## Class: Subject

```csv
Class,No,Method,Description
"Subject",-,"None","Entity representing pickleball subject with name description level status publicUrl createdBy lessons createdAt updatedAt deletedAt"
```

## Class: User

```csv
Class,No,Method,Description
"User",-,"None","Entity representing platform user (coach role)"
```

## Class: Lesson

```csv
Class,No,Method,Description
"Lesson",-,"None","Entity representing lesson belonging to subject with title video quiz"
```

## Class: AiSubjectGeneration

```csv
Class,No,Method,Description
"AiSubjectGeneration",-,"None","Entity representing AI-generated subject with prompt generatedData (name description level lessons) status (PENDING USED) requestedBy createdSubject createdAt updatedAt deletedAt"
```

## Class: CreateSubjectDto

```csv
Class,No,Method,Description
"CreateSubjectDto",-,"None","DTO carrying name description level (BEGINNER INTERMEDIATE ADVANCED)"
```

## Class: UpdateSubjectDto

```csv
Class,No,Method,Description
"UpdateSubjectDto",-,"None","DTO carrying optional name description level status (DRAFT PUBLISHED)"
```

## Class: UpdateAiGeneratedSubjectDto

```csv
Class,No,Method,Description
"UpdateAiGeneratedSubjectDto",-,"None","DTO carrying name description level lessons (with name description lessonNumber video quiz)"
```
