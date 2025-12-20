# Feature: Manage Lesson Video

## Controllers

| Class | No | Method | Description |
|-------|----|--------------------|-------------|

### VideoController

| No | Method | Description |
|----|--------|-------------|
| 1 | getVideosByLesson(id) | Get all videos by lesson ID with pagination |
| 2 | getVideosBySession(id) | Get all videos by session ID with pagination |
| 3 | getVideoById(id) | Get single video details by ID |
| 4 | createLessonVideo(id, videoFile, data) | Create new lesson video with file upload (COACH only) |
| 5 | uploadSessionVideo(id, videoFile, data) | Create new session video with file upload (COACH only, session video only) |
| 6 | updateVideo(id, data, videoFile?) | Update existing video with optional file replacement (COACH only, lesson video only) |
| 7 | deleteVideo(id) | Soft delete video by ID (COACH only, lesson video only) |

## Services

### VideoService

| No | Method | Description |
|----|--------|-------------|
| 1 | getVideoByLesson(lessonId) | Query videos by lesson ID, return list with relations |
| 2 | getVideoBySession(sessionId) | Query videos by session ID, return list with relations |
| 3 | getVideoById(id) | Find single video by ID with relations |
| 4 | createLessonVideo(lessonId, data, file) | Transaction: verify lesson ownership, upload to Bunny CDN, extract metadata with FFmpeg, create video record |
| 5 | createSessionVideo(sessionId, data, file) | Transaction: verify session ownership, upload to Bunny CDN, extract metadata with FFmpeg, create video record (session video only) |
| 6 | updateVideo(id, data, file?) | Transaction: verify ownership, optionally replace file on Bunny CDN, update video record (lesson video only) |
| 7 | deleteVideo(id) | Transaction: verify ownership, soft delete video (set deletedAt) (lesson video only) |

### BunnyService

| No | Method | Description |
|----|--------|-------------|
| 1 | uploadVideo(file) | Upload video file to Bunny CDN, return publicUrl and thumbnailUrl |
| 2 | deleteVideo(url) | Delete video file from Bunny CDN |

### FFmpegService

| No | Method | Description |
|----|--------|-------------|
| 1 | extractMetadata(file) | Extract video duration and resolution using FFmpeg |

## Guards

### AuthGuard
Validates JWT token from request headers for all video endpoints.

### RoleGuard
Checks user role (COACH) for create, update, delete operations.

## Entities

### Video
Represents a video associated with a lesson or session. Properties: id, title, description, duration, publicUrl, thumbnailUrl, drillName, drillDescription, drillPracticeSets, status (PENDING/READY/PUBLISHED/REJECTED), uploadedBy (User), lesson (Lesson), session (Session), createdAt, updatedAt, deletedAt.

### Lesson
Represents a lesson in a subject. Has many videos. Properties: id, name, lessonNumber, subject, videos.

### Session
Represents a session in a course schedule. Has many videos. Properties: id, schedule, videos.

### User
Represents the coach who uploads videos. Properties: id, fullName, role.

## DTOs

### CreateVideoDto
Input for creating video. Fields: title (string), description (string), drillName (string), drillDescription (string), drillPracticeSets (number).

### UpdateVideoDto
Input for updating video. All fields optional: title?, description?, drillName?, drillDescription?, drillPracticeSets?.

## Scope Rules

- **Ownership Validation**: All operations verify that lesson/session creator is current user
- **Session Video Restrictions**: Session videos can only be created (passing sessionId), cannot be updated or deleted
- **Lesson Video Operations**: Lesson videos support full CRUD (create, update, delete) operations
- **File Upload**: Videos uploaded via multipart/form-data with FileInterceptor
- **CDN Integration**: BunnyService handles upload/delete on Bunny CDN
- **Metadata Extraction**: FFmpegService extracts duration and resolution from uploaded files
- **Video Status**: Initial status is PENDING, can be updated to READY/PUBLISHED/REJECTED (lesson videos only)
- **Soft Delete**: Only lesson videos are soft deleted with deletedAt timestamp
- **Relations**: Videos can belong to either Lesson or Session (not both)
