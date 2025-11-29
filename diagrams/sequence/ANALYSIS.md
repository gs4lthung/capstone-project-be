# Sequence Diagram Analysis - Capstone Project

## Current Implementation Status

### ✅ Already Implemented

**Video Management (VideoController, VideoService):**
- `POST /videos/lessons/:id` → `createLessonVideo()` ✅
- `POST /videos/sessions/:id` → `uploadSessionVideo()` ✅
- `GET /videos/lessons/:id` → `getVideoByLesson()` ✅
- `GET /videos/sessions/:id` → `getVideoBySession()` ✅
- `GET /videos/:id` → `getVideoById()` ✅
- `PUT /videos/:id` → `updateVideo()` ✅
- `DELETE /videos/:id` → `deleteVideo()` ✅

**Learner Videos (LearnerVideoController, LearnerVideoService):**
- `POST /learner-videos` → `uploadLearnerVideo()` ✅
- `POST /learner-videos/:learnerVideoId/coach-videos/:coachVideoId/overlay` → `generateOverlayVideo()` ✅
- `POST /learner-videos/:learnerVideoId/ai-feedback` → `saveAiFeedback()` ✅
- `GET /learner-videos` → `getLearnerVideos()` ✅
- `GET /learner-videos/user/:userId` → `getLearnerVideosByUser()` ✅
- `GET /learner-videos/user/:userId/coach-video/:coachVideoId` → `getLearnerVideosByUserAndCoachVideo()` ✅
- `GET /learner-videos/:id` → `getLearnerVideoById()` ✅

**AI Video Comparison (AiVideoCompareResultController, AiVideoCompareResultService):**
- `POST /ai-video-compare-results/compare-videos` → `compareVideos()` ✅
- `GET /ai-video-compare-results/users/:userId` → `getAllByUserId()` ✅
- `GET /ai-video-compare-results/:id` → `getById()` ✅
- `GET /ai-video-compare-results?learnerVideoId=X` → `getAllByLearnerVideo()` ✅
- `GET /ai-video-compare-results/sessions/:sessionId` → `getBySession()` ✅

**Request Management (RequestController, RequestService):**
- `GET /requests` → `findAll()` with pagination/sorting/filtering ✅
- `GET /requests/:id` → `findOne()` ✅
- ⚠️ **MISSING:** `POST /requests/:id/approve` - Admin approval endpoint
- ⚠️ **MISSING:** `POST /requests/:id/reject` - Admin rejection endpoint

**Video Conference (VideoConferenceController, VideoConferenceService):**
- `GET /video-conferences/courses/:id` → `getByCourseId()` ✅

**Existing Diagrams (6):**
- ✅ guest-as-learner.puml
- ✅ coach-registration.puml
- ✅ admin-verify-coach.puml
- ✅ admin-login-update-configuration.puml
- ✅ coach-login-create-content.puml
- ✅ coach-login-wallet-withdrawal.puml

---

## Created Sequence Diagrams for Architecture Reference (12)

**These diagrams document desired workflows and are created for planning purposes:**

1. 📋 learner-course-enrollment-payment.puml - Uses PayOS, Enrollment, Wallet services
2. 📋 learner-upload-practice-video.puml - Uses existing LearnerVideo + AI services
3. 📋 learner-take-quiz.puml - Requires Quiz service implementation
4. 📋 learner-join-session.puml - Uses existing VideoConference + Agora
5. 📋 coach-approve-course.puml - Requires Request approval endpoints
6. 📋 admin-approve-video.puml - Requires Request approval endpoints
7. 📋 learner-progress-achievement.puml - Requires LearnerProgress service
8. 📋 session-earnings-payout.puml - Requires SessionEarning, Wallet services
9. 📋 course-cancellation.puml - Requires Request approval + Refund logic
10. 📋 learner-feedback.puml - Requires Feedback service
11. 📋 coach-schedule-management.puml - Requires Schedule, Session generation
12. 📋 admin-platform-analytics.puml - Requires PlatformAnalysis service

**⚠️ Important:** These diagrams show DESIRED workflows and may include endpoints/features that don't exist yet.

---

## Workflows Requiring Implementation

### 1. Learner Course Enrollment & Payment ⭐ HIGH PRIORITY

**Status:** Not implemented. Requires Payment service endpoints and Enrollment creation logic.

**Required Endpoints:**
- `POST /payments/courses/{courseId}` - Create payment link
- `POST /payments/webhook` - PayOS callback handler
- `POST /enrollments` - Create enrollment after payment success

**Key Services:** Payment, Enrollment, Wallet

---

### 2. Learner Upload Practice Video & Get AI Feedback ⭐ HIGH PRIORITY

**Status:** ✅ PARTIALLY IMPLEMENTED

**Already Exists:**
- `POST /learner-videos` → `uploadLearnerVideo()` ✅
- `POST /learner-videos/:id/ai-feedback` → `saveAiFeedback()` ✅
- `POST /ai-video-compare-results/compare-videos` → `compareVideos()` ✅

**Files:** `learner-video.controller.ts`, `ai-video-compare-result.controller.ts`

**Complete & Ready to use for diagram reference**

---

### 3. Learner Take Quiz & Get Results ⭐ HIGH PRIORITY

**Status:** Not fully implemented. Controller exists but endpoints may be incomplete.

**Required Endpoints:**
- `POST /quiz-attempts` - Start quiz
- `POST /quiz-attempts/{id}/submit` - Submit answers
- `GET /quiz/{id}` - Get quiz questions

**Key Services:** Quiz, LearnerProgress, Achievement

---

### 4. Learner Join Session (Video Conference) ⭐ HIGH PRIORITY

**Status:** ✅ PARTIALLY IMPLEMENTED

**Already Exists:**
- `GET /video-conferences/courses/:id` → `getByCourseId()` ✅ (Gets Agora token)

**Missing:**
- `POST /sessions/{sessionId}/join` - Join session endpoint
- Attendance logging endpoints

**Key Services:** VideoConference, Session, Attendance

---

### 5. Coach Approve Course (Request Workflow) ⭐ HIGH PRIORITY

**Status:** Request Query exists, but approval endpoints missing.

**Already Exists:**
- `GET /requests` → `findAll()` ✅
- `GET /requests/:id` → `findOne()` ✅

**Missing:**
- `POST /requests/:id/approve` - Admin approve course
- `POST /requests/:id/reject` - Admin reject course

**Key Services:** Request, Course

---

### 6. Admin Approve Video (Coach Comparison Video) ⚠️ MEDIUM PRIORITY

**Status:** Request query exists, but approval endpoints missing.

**Already Exists:**
- `POST /videos/lessons/:id` → `createLessonVideo()` ✅
- Video processing pipeline ✅

**Missing:**
- `POST /requests/:id/approve` - Admin approve video
- `POST /requests/:id/reject` - Admin reject video

**Key Services:** Request, Video

---

### 7. Learner Progress Tracking & Achievement ⚠️ MEDIUM PRIORITY

**Status:** Achievement service exists, progress tracking may need enhancement.

**Already Exists:**
- `AchievementService` - Achievement management ✅
- `AchievementTrackingService` - Tracking ✅

**May Need:**
- `LearnerProgressService` - Progress updates endpoint

**Key Services:** LearnerProgress, Achievement

---

### 8. Session Earnings & Coach Payout ⚠️ MEDIUM PRIORITY

**Status:** Not implemented.

**Required Services:**
- SessionEarning service
- Wallet credit logic
- Payout calculations

**Key Entities:** SessionEarning, Wallet, WalletTransaction

---

### 9. Course Request Cancellation ⚠️ MEDIUM PRIORITY

**Status:** Not implemented.

**Required Endpoints:**
- `POST /requests/:id/approve` - Approve cancellation
- Course refund logic
- Bulk notification logic

**Key Services:** Request, Course, Payment, Notification

---

### 10. Learner Feedback on Course 📋 LOW PRIORITY

**Status:** Service exists, endpoints may be complete.

**Likely Exists:**
- FeedbackService
- FeedbackController

**Key Services:** Feedback, Course

---

### 11. Coach Schedule Management 📋 LOW PRIORITY

**Status:** Partial implementation.

**Likely Exists:**
- ScheduleService
- Session generation logic

**Key Services:** Schedule, Session

---

### 12. Admin Platform Analytics 📋 LOW PRIORITY

**Status:** Service exists.

**Likely Exists:**
- `PlatformAnalysisService`
- `PlatformAnalysisController`

**Key Services:** PlatformAnalysis

---

## Priority Implementation Order

### Phase 1 (Critical - Core Workflows)
1. ✅ Guest registration as learner
2. ✅ Coach registration & verification
3. ✅ Coach content creation (subject/lesson/quiz/video)
4. **→ Learner course enrollment & payment** (NEXT)
5. **→ Learner quiz workflow** (NEXT)
6. **→ Learner practice video upload** (NEXT)
7. **→ Session join & video conference** (NEXT)

### Phase 2 (Important - Business Logic)
8. Coach course approval requests
9. Coach video approval requests
10. Session earnings & payout
11. Learner progress & achievements
12. Course cancellation with refunds

### Phase 3 (Enhancement - Polish)
13. Learner feedback
14. Coach schedule management
15. Platform analytics

---

## Key Integration Points

### Payment Flow
- Learner → PayOS → Payment Callback → Enrollment creation → Wallet update

### Video Processing Pipeline
- Upload → FFmpeg processing → Thumbnail generation → AI comparison → Feedback

### Achievement System
- Quiz completion → Score check → Progress update → Achievement evaluation → Award

### Session Workflow
- Schedule → Session creation → Agora room → Video conference → Attendance → Earning

---

## Entity Relationship Summary

**Core Learning Path:**
```
Learner → Course (Enrollment) → Session + Lesson
                                   ├─ Quiz (QuizAttempt, LearnerAnswer)
                                   ├─ Video (Coach) + LearnerVideo (Practice)
                                   └─ Achievement (if completed)
```

**Financial Flow:**
```
Payment → Enrollment → Session → SessionEarning → Wallet → Withdrawal
```

**Content Management:**
```
Coach → Subject → Lesson → Quiz/Video/LearnerVideo
              ↓
        (Request/Approval)
              ↓
        Available to Learners
```

---

## What's Actually Implemented vs What's in Diagrams

### ✅ Implemented & Ready to Use
- Video upload/management (lessons, sessions)
- Learner video upload with AI comparison
- Video conference basic infrastructure (Agora tokens)
- Request query endpoints (GET only)
- Achievement system
- Various service layers

### ⚠️ Partially Implemented
- Quiz system (controller exists, endpoints may be incomplete)
- LearnerProgress service
- Schedule service
- Platform analytics service

### ❌ Not Implemented Yet
- Payment endpoints and PayOS integration
- Request approval/rejection endpoints (POST /requests/:id/approve|reject)
- Session join endpoint
- Enrollment creation from payment
- SessionEarning calculations
- Refund processing
- Course cancellation workflow
- Various notification endpoints

### 📋 Diagrams Created For Reference
The 12 new sequence diagrams show DESIRED workflows and architecture. They reference endpoints and features that may not all exist yet. Use them for:
- Understanding how features should work end-to-end
- Planning implementation roadmap
- Identifying missing pieces
- Architecture discussion

**Before implementing code, verify what endpoints actually exist in the controllers!**

---

**Last Updated:** November 28, 2025
**Project:** Pickleball Learning Platform
**Status:** Analysis Complete - Diagrams Reflect Desired Architecture
