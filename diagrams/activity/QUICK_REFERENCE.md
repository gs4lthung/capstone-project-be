# Activity Diagrams - Quick Reference Guide

## 📊 Complete Activity Diagram Collection

**Location:** `diagrams/activity/`  
**Total Diagrams:** 8  
**Created:** November 29, 2025  
**Status:** ✅ Ready for use

---

## 🎯 Diagrams by User Role

### 👨‍🏫 Coach Workflows (3 diagrams)

#### 1. **coach-course-creation.puml**
- **Flow:** Login → Subject Selection → Course Details → Submit → Approval → Content Creation
- **Key Status Transitions:** 
  - PENDING_APPROVAL → APPROVED → READY_OPENED
  - PENDING_APPROVAL → REJECTED
- **Decision Points:** Valid login?, Admin approval?
- **Stakeholders:** Coach, Admin
- **Time Frame:** Days to weeks
- **Outcome:** Published course ready for enrollment

---

#### 2. **coach-session-earning.puml**
- **Flow:** Schedule Session → Start Conference → Conduct Class → End Session → Attendance → Calculate Earnings → Wallet Credit
- **Key Operations:**
  - Video conference initialization (Agora)
  - Real-time attendance tracking
  - Automatic earnings calculation
  - Platform fee deduction
- **Formula:** Earning = Course_Price / Total_Sessions - Platform_Fee
- **Stakeholders:** Coach, System, Learners
- **Time Frame:** Per session (typically 1-2 hours)
- **Outcome:** Coach wallet credited with earnings

---

#### 3. **coach-wallet-withdrawal.puml**
- **Flow:** View Wallet → Initiate Withdrawal → Amount Validation → Bank Details → Confirmation → Process → Notification
- **Key Status:** PENDING → COMPLETED
- **Validations:**
  - Sufficient balance check
  - Bank account verification
  - Amount limits (if applicable)
- **Stakeholders:** Coach, Bank, System
- **Time Frame:** 1-3 business days processing
- **Outcome:** Money transferred to coach's bank account

---

### 📚 Learner Workflows (3 diagrams)

#### 4. **learner-enrollment-payment.puml**
- **Flow:** Browse → View Details → Decide → Pay → Enroll → Access Content
- **Key Decision Points:**
  - Interested in course?
  - Already enrolled?
  - Terms agreement?
  - Sufficient funds?
- **Payment Options:**
  - Wallet balance
  - Online payment (PayOS)
  - Bank transfer
- **Stakeholders:** Learner, Coach, System
- **Time Frame:** Minutes to hours
- **Outcome:** Active enrollment, course access granted

---

#### 5. **learner-quiz-progress.puml**
- **Flow:** Complete Lesson → Start Quiz → Answer → Submit → Grade → Check Progress → Achievement Check
- **Key Calculations:**
  - Per-question points
  - Total score = (Points_Earned / Total_Points) × 100
  - Pass threshold comparison
- **Status Outcomes:**
  - PASSED (if score ≥ passing threshold)
  - FAILED (if score < passing threshold, allow retry)
- **Achievement Trigger:** All lesson activities complete
- **Stakeholders:** Learner, System
- **Time Frame:** Variable (per quiz)
- **Outcome:** Progress updated, achievements potentially unlocked

---

#### 6. **learner-feedback-evaluation.puml**
- **Flow:** Complete Course → Feedback Form → Rating → Comment → Submit → Notify Coach → Update Rating → History
- **Evaluation Aspects:**
  - Content quality (1-5)
  - Coach effectiveness (1-5)
  - Pacing & difficulty (1-5)
  - Learning materials (1-5)
  - Overall value (1-5)
- **Anonymous Option:** Yes/No
- **System Impact:**
  - Course rating updated
  - Coach receives notification
  - Coach can respond/improve
- **Stakeholders:** Learner, Coach, System
- **Time Frame:** Post-completion
- **Outcome:** Course rating calculated, coach receives insights

---

### 👨‍💼 Admin Workflows (2 diagrams)

#### 7. **admin-coach-verification.puml**
- **Flow:** Coach Registration → Document Submission → Admin Review → Verification Decision → Status Update
- **Status Paths:**
  - PENDING_VERIFICATION → VERIFIED (approved)
  - PENDING_VERIFICATION → REVISION_NEEDED (incomplete)
  - PENDING_VERIFICATION → INCOMPLETE (missing docs)
- **Document Types:**
  - ID/Passport
  - Teaching credentials
  - Experience certificates
  - Profile information
- **Verification Check:** Credentials valid? Documents complete?
- **Post-Verification:** Activity monitoring, policy compliance
- **Stakeholders:** Coach, Admin, System
- **Time Frame:** Days (review process)
- **Outcome:** Coach status determined, permissions adjusted

---

#### 8. **admin-analytics-config.puml**
- **Flow:** Login → View Analytics → Monitor Metrics → Adjust Config → Monitor Health → Review Approvals → Generate Reports
- **Analytics Viewed:**
  - Monthly revenue
  - Learner count
  - Active courses
  - Completed sessions
  - New coaches
- **Configurable Items:**
  - Platform fee percentage
  - Min/Max course prices
  - Withdrawal settings
  - Session constraints
- **Monitoring Areas:**
  - Database status
  - API performance
  - Error logs
  - System health
- **Stakeholders:** Admin, System, Finance
- **Time Frame:** Daily/Weekly monitoring
- **Outcome:** Platform optimized, insights gained

---

## 🔄 User Journey Map

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  COACH ONBOARDING│     │ LEARNER JOURNEY  │     │ ADMIN OVERSIGHT  │
└────────┬────────┘     └─────────┬────────┘     └────────┬─────────┘
         │                        │                       │
         │ Registration            │ Browse               │ Monitor
         │ & Verification          │ & Explore            │ Platform
         │     ↓                    │     ↓               │     ↓
         │ Create Course            │ Select Course       │ Verify Coaches
         │     ↓                    │     ↓               │     ↓
         │ Add Content              │ Enroll & Pay        │ Analytics
         │ (Lessons/Quizzes)        │     ↓               │ Dashboard
         │     ↓                    │ Complete Lessons    │     ↓
         │ Schedule Sessions        │     ↓              │ Config Settings
         │     ↓                    │ Take Quizzes        │     ↓
         │ Conduct Sessions         │     ↓              │ Report
         │ & Earn                   │ Leave Feedback      │ Generation
         │     ↓                    │     ↓              │     ↓
         │ Withdraw Earnings        │ View Achievements   │ System Health
         │                          │ & Progress          │
         └──────────────────────────────────────────────────────┘
                         Connected Platform
```

---

## 📋 Quick Decision Trees

### Coach Course Creation - Approval Path
```
Submit Course
    ↓
Admin Reviews
    ├─ ✅ Approved → Coach adds content → Publish
    └─ ❌ Rejected → Coach edits & resubmit
```

### Learner Quiz - Scoring Path
```
Submit Answers
    ↓
Calculate Score (points ÷ total × 100)
    ↓
Compare to passing threshold
    ├─ ✅ Passed (≥ threshold) → Unlock next
    └─ ❌ Failed (< threshold) → Allow retry
```

### Coach Withdrawal - Processing Path
```
Request Withdrawal
    ↓
Validate Amount
    ├─ ✅ Sufficient balance → Process
    │   ↓
    │   Add to bank queue
    │   ↓
    │   Bank transfer (1-3 days)
    │   ↓
    │   Status = COMPLETED
    │
    └─ ❌ Insufficient → Show error
```

---

## 🔗 Relationship to Other Diagram Types

| Diagram Type | Complements | Use Case |
|---|---|---|
| **Activity** (this folder) | Sequence Diagrams | "How do users complete tasks?" |
| **Sequence** | Activity Diagrams | "How do systems communicate?" |
| **State-Machine** | All diagrams | "What are valid state transitions?" |
| **Package** (Class) | All diagrams | "What's the system architecture?" |

---

## 🛠️ Implementation Guidelines

### For Backend Developers
- Implement endpoints referenced in activity flows
- Handle decision points with proper validation
- Ensure status transitions match diagram paths
- Implement error handling for failed conditions

### For Frontend Developers
- Create UI flows matching activity steps
- Implement decision branches visually
- Show progress/status to users
- Handle conditional navigation

### For QA/Testing
- Create test cases for each decision path
- Test both success and failure branches
- Verify status transitions
- Validate notifications and confirmations

### For DevOps
- Monitor system performance at key activities
- Alert on failures in critical paths
- Scale resources based on activity load
- Track metrics for each workflow

---

## 📈 Metrics by Workflow

| Workflow | Key Metric | Target |
|---|---|---|
| Coach Course Creation | Time to approval | < 2 days |
| Coach Session Earning | Payout processing | 1-3 days |
| Learner Enrollment | Payment processing | < 5 minutes |
| Quiz Completion | Auto-grading | < 1 second |
| Coach Verification | Review time | < 5 days |
| Platform Analytics | Data freshness | < 1 hour |

---

## 🎓 Training Resources

### For New Team Members
1. Start with **coach-course-creation.puml** - Core flow
2. Learn **learner-enrollment-payment.puml** - Revenue model
3. Understand **coach-session-earning.puml** - Key value proposition
4. Review **admin-coach-verification.puml** - Quality control
5. Study **admin-analytics-config.puml** - Operations

### For Stakeholders
- Use all diagrams in presentations
- Highlight decision points and validations
- Show status transitions and outcomes
- Explain user journeys and touchpoints

---

## 📞 Support & Questions

### Common Questions

**Q: Why are some paths conditional?**
A: Real-world processes have validations, business rules, and user choices that create multiple paths.

**Q: What happens in error cases?**
A: Activity diagrams show the happy path primarily. Error handling is implemented in code but noted in activities.

**Q: How often are these updated?**
A: Update when workflows change, new features added, or business rules modify.

**Q: Can I modify these diagrams?**
A: Yes! Follow PlantUML syntax and keep the /activity/ folder organized.

---

**Last Updated:** November 29, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
