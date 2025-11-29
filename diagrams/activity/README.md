# Activity Diagrams - Capstone Project

This folder contains detailed **Activity Diagrams** that visualize the step-by-step workflows and processes for all major user interactions in the platform.

## 📋 Activity Diagrams Overview

Activity diagrams show the **flow of activities** and **decision points** throughout different user workflows. They complement sequence diagrams by focusing on the **logical sequence of actions** rather than message passing between objects.

---

## 📑 Diagrams Included

### **1. coach-course-creation.puml** 👨‍🏫
**Coach Course Creation Workflow**
- Coach login with phone authentication
- Select subject and enter course details
- Submit course creation request
- Admin approval/rejection process
- Content creation (lessons, quizzes, videos)
- Course publication workflow
- Status: PENDING_APPROVAL → APPROVED → READY_OPENED

---

### **2. learner-enrollment-payment.puml** 📚
**Learner Course Enrollment & Payment Workflow**
- Search and browse available courses
- View course details and pricing
- Enrollment form submission
- Payment method selection
  - Wallet payment
  - Online payment (PayOS)
  - Bank transfer
- Payment processing
- Enrollment confirmation
- Access to course materials

---

### **3. coach-session-earning.puml** 💰
**Coach Session Management & Earning Workflow**
- Coach prepares and initiates session
- Start video conference (Agora)
- Conduct class and monitor attendance
- End session and record completion
- Attendance marking for learners
- Automatic earnings calculation
  - Earnings = Course price / Total sessions
  - Deduct platform fee
- Wallet credit and transaction recording
- Session analytics and feedback review

---

### **4. learner-quiz-progress.puml** ✍️
**Learner Quiz Attempt & Progress Workflow**
- Learner completes lesson content
- Quiz availability check
- Start quiz and load questions
- Answer all quiz questions
- Submit quiz for grading
- Automatic score calculation
  - Point accumulation
  - Percentage calculation
  - Pass/fail determination
- Achievement evaluation
- Progress tracking
- Lesson completion status update

---

### **5. admin-coach-verification.puml** ✅
**Admin Coach Verification Workflow**
- New coach registration
- Document submission (ID, credentials, experience)
- Coach status = PENDING_VERIFICATION
- Admin document review process
- Validation of credentials
- Approval/Rejection decision
- Status transitions:
  - PENDING_VERIFICATION → VERIFIED
  - PENDING_VERIFICATION → REVISION_NEEDED
  - PENDING_VERIFICATION → INCOMPLETE
- Coach activity monitoring
- Policy violation handling

---

### **6. learner-feedback-evaluation.puml** ⭐
**Learner Feedback & Course Evaluation**
- Course completion acknowledgment
- Feedback form submission
- Rating system (1-5 stars)
- Aspect-based evaluation
  - Content quality
  - Coach effectiveness
  - Pacing & difficulty
  - Learning materials
  - Overall value
- Anonymous feedback option
- Feedback submission and confirmation
- Coach notification
- Course rating calculation
- Learner feedback history
- Course recommendation option

---

### **7. coach-wallet-withdrawal.puml** 🏦
**Coach Wallet & Withdrawal Workflow**
- View wallet balance and earnings
- Initiation of withdrawal request
- Amount validation
- Bank account selection/addition
- Verification of withdrawal details
- Fee calculation and display
- Withdrawal submission
- Status: PENDING → COMPLETED
- Wallet debit and transaction recording
- Withdrawal history tracking
- Dispute handling option

---

### **8. admin-analytics-config.puml** 📊
**Admin Platform Analytics & Configuration**
- Admin dashboard access
- View platform analytics
  - Monthly revenue
  - Number of learners
  - Active courses
  - Completed sessions
  - New coaches
- Configuration adjustments
  - Platform fee percentage
  - Course price limits
  - Withdrawal settings
  - Session constraints
- System health monitoring
  - Database status
  - API performance
  - Error logs
- Pending approvals review
- Weekly report generation

---

## 🎯 Key Workflow Categories

### **Coach Workflows** 👨‍🏫
1. Course Creation (coach-course-creation.puml)
2. Session Management (coach-session-earning.puml)
3. Wallet Management (coach-wallet-withdrawal.puml)

### **Learner Workflows** 📚
1. Enrollment & Payment (learner-enrollment-payment.puml)
2. Quiz Attempts (learner-quiz-progress.puml)
3. Course Feedback (learner-feedback-evaluation.puml)

### **Admin Workflows** 👨‍💼
1. Coach Verification (admin-coach-verification.puml)
2. Analytics & Configuration (admin-analytics-config.puml)

---

## 🔄 Activity Diagram Elements

Each diagram includes:
- **Start/End** nodes (circles)
- **Activities** (rounded rectangles) - Specific actions
- **Decision nodes** (diamonds) - Conditional branches
- **Parallel processing** (forks/joins) - Concurrent activities
- **Notes** - Context and details
- **Guards** - Conditions for transitions

---

## 📊 Relationship to Other Diagrams

| Diagram Type | Purpose | Location |
|---|---|---|
| **Sequence Diagrams** | Message flow between actors | `/sequence/` |
| **State Diagrams** | Entity state transitions | `/state-machine/` |
| **Activity Diagrams** | Step-by-step workflows | `/activity/` |
| **Class Diagrams** | System architecture | `/package/` |

---

## 🛠️ Usage Guidelines

### For Developers
- Use activity diagrams to understand workflow logic
- Implement error handling at decision points
- Follow the status transitions shown
- Validate inputs before state changes

### For Project Managers
- Use to explain system flows to stakeholders
- Identify process bottlenecks
- Plan sprint tasks based on activities
- Track feature completion

### For Testing
- Create test cases for each decision branch
- Test both success and failure paths
- Verify status transitions
- Validate user notifications

### For Documentation
- Include in API documentation
- Reference in user guides
- Show in process documentation
- Update when workflows change

---

## 🔍 PlantUML Syntax Notes

These diagrams use PlantUML activity diagram syntax:
```plantuml
start
:Activity description;
decision
if (condition?) then (yes)
  :Activity if true;
else (no)
  :Activity if false;
endif
stop
```

---

## 📝 Last Updated
November 29, 2025

**Status:** ✅ All 8 core activity diagrams created and verified
