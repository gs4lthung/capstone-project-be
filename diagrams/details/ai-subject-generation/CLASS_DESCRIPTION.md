# Feature: AI Subject Generation

- Controller: `AiSubjectGenerationController.findAll(pagination, sort, filter)`, `AiSubjectGenerationController.findOne(id)`, `AiSubjectGenerationController.create(prompt)`, `AiSubjectGenerationController.useGeneratedSubject(id)`, `AiSubjectGenerationController.update(id, data)`, `AiSubjectGenerationController.delete(id)`
- Service: `AiSubjectGenerationService.findAll(findOptions)`, `AiSubjectGenerationService.findOne(id)`, `AiSubjectGenerationService.create(prompt)`, `AiSubjectGenerationService.saveNewSubject(id)`, `AiSubjectGenerationService.update(id, data)`, `AiSubjectGenerationService.delete(id)`, `AiGeminiService.generateSubjectFromPrompt(prompt)`
- Entities: `AiSubjectGeneration`, `Subject`, `User`, `Lesson`
- Utilities: `AuthGuard`, `AiGeminiService`, `DataSource`

Scope rules:
- Coach can generate subjects using AI with text prompts via Gemini API
- AI-generated subjects are saved with status PENDING for review
- Coach can view/edit PENDING AI generations before using
- Only generation owner can access their AI generations (ownership validation)
- Coach can convert PENDING AI generation to actual Subject entity
- Once used, AI generation status becomes USED and cannot be edited
- Subject created from AI has isAIGenerated=true and status=DRAFT
- All operations require authentication (AuthGuard)
- Delete is soft delete (sets deletedAt timestamp)
- Quiz validation: each question must have exactly 1 correct answer
- Use DataSource for database operations (no individual repositories in sequences)

## Class: AiSubjectGenerationController

```csv
Class,No,Method,Description
"AiSubjectGenerationController",01,"findAll(pagination, sort, filter): Promise<PaginatedResponse<AiSubjectGeneration>>","Retrieves all AI subject generations with pagination sorting and filtering (Coach only AuthGuard)"
"AiSubjectGenerationController",02,"findOne(id: number): Promise<AiSubjectGeneration>","Retrieves single AI generation by ID; validates ownership (Coach only AuthGuard)"
"AiSubjectGenerationController",03,"create(prompt: string): Promise<AiSubjectGeneration>","Coach generates subject using AI with text prompt via Gemini API (Coach only AuthGuard)"
"AiSubjectGenerationController",04,"useGeneratedSubject(id: number): Promise<Response>","Coach converts PENDING AI generation to actual Subject entity with status=DRAFT (Coach only AuthGuard)"
"AiSubjectGenerationController",05,"update(id: number, data: UpdateAiGeneratedSubjectDto): Promise<Response>","Coach updates PENDING AI generation; validates ownership and PENDING status (Coach only AuthGuard)"
"AiSubjectGenerationController",06,"delete(id: number): Promise<Response>","Coach soft deletes AI generation; validates ownership (Coach only AuthGuard)"
```

## Class: AiSubjectGenerationService

```csv
Class,No,Method,Description
"AiSubjectGenerationService",01,"findAll(findOptions): Promise<PaginatedResponse<AiSubjectGeneration>>","Retrieves paginated list of AI generations from DataSource with optional filters"
"AiSubjectGenerationService",02,"findOne(id): Promise<AiSubjectGeneration>","Retrieves AI generation with requestedBy relation from DataSource; validates ownership (requestedBy == currentUser)"
"AiSubjectGenerationService",03,"create(prompt): Promise<AiSubjectGeneration>","Calls AiGeminiService.generateSubjectFromPrompt with prompt; creates AiSubjectGeneration record with status=PENDING generatedData from AI response and requestedBy=currentUser; saves to DataSource; returns saved entity"
"AiSubjectGenerationService",04,"saveNewSubject(id): Promise<Response>","Transaction: Selects AI generation from DataSource; validates ownership and not USED; creates Subject entity with isAIGenerated=true name description level lessons from generatedData status=DRAFT and createdBy=requestedBy; inserts Subject; updates AI generation status=USED and links createdSubject; commits transaction"
"AiSubjectGenerationService",05,"update(id, data): Promise<Response>","Selects AI generation with requestedBy and createdSubject from DataSource; validates ownership (requestedBy == currentUser); checks status != USED (throw error if USED); validates each quiz question has exactly 1 correct answer (throw error if not); updates generatedData with new name description level and lessons (with video and quiz); saves to DataSource"
"AiSubjectGenerationService",06,"delete(id): Promise<Response>","Selects AI generation with requestedBy from DataSource; validates ownership (requestedBy == currentUser); soft deletes by setting deletedAt=NOW() in DataSource"
```

## Class: AuthGuard

```csv
Class,No,Method,Description
"AuthGuard",01,"canActivate(context): boolean","Validates JWT token and authenticates user"
```

## Class: AiGeminiService

```csv
Class,No,Method,Description
"AiGeminiService",01,"generateSubjectFromPrompt(prompt): Promise<AiSubjectGenerationResponse>","Builds system prompt with user prompt and instructions; calls Gemini API with contents and generationConfig (response_mime_type=application/json response_schema=AiSubjectGenerationSchema); parses JSON response; validates structure; returns generated subject with name description level and lessons array (each lesson has name description lessonNumber video with title description tags drillName drillDescription drillPracticeSets and quiz with title description questions with title explanation options with content isCorrect)"
```

## Class: AiSubjectGeneration

```csv
Class,No,Method,Description
"AiSubjectGeneration",-,"None","Entity representing AI-generated subject with prompt (text input) generatedData (AiSubjectGenerationResponse JSON) status (PENDING or USED) requestedBy (User relation) createdSubject (Subject relation nullable) createdAt updatedAt deletedAt"
```

## Class: Subject

```csv
Class,No,Method,Description
"Subject",-,"None","Entity representing pickleball subject with isAIGenerated name description level status publicUrl createdBy lessons createdAt updatedAt deletedAt"
```

## Class: User

```csv
Class,No,Method,Description
"User",-,"None","Entity representing platform user (coach role)"
```

## Class: Lesson

```csv
Class,No,Method,Description
"Lesson",-,"None","Entity representing lesson with name description lessonNumber video quiz"
```

## Class: UpdateAiGeneratedSubjectDto

```csv
Class,No,Method,Description
"UpdateAiGeneratedSubjectDto",-,"None","DTO carrying name description level lessons (array with name description lessonNumber video object with title description tags drillName drillDescription drillPracticeSets and quiz object with title description questions array with title explanation options array with content isCorrect)"
```
