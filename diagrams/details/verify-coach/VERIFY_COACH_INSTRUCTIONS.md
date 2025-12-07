# Verify Coach Diagram Instructions

## Overview

The Verify Coach diagrams illustrate the admin workflow for reviewing, approving, or rejecting coach profiles with their credentials.

For general class diagram guidelines, see: [`../CLASS_DIAGRAM_INSTRUCTIONS.md`](../CLASS_DIAGRAM_INSTRUCTIONS.md)

## Diagrams Included

### 1. Sequence Diagrams

#### Approve Coach (sequence.puml)

Shows the workflow for approving a coach profile:

1. Admin views pending coach profiles
2. System queries coaches filtered by UNVERIFIED status
3. Admin clicks on a coach to view details
4. System retrieves coach profile with all credentials
5. Admin reviews profile and credentials
6. Admin clicks approve button
7. System updates coach verification status to VERIFIED
8. System activates user account (isActive = true)
9. Approval complete

#### Reject Coach (sequence-reject.puml)

Shows the workflow for rejecting a coach profile:

1. Admin views pending coach profiles
2. System queries coaches filtered by UNVERIFIED status
3. Admin clicks on a coach to view details
4. System retrieves coach profile with all credentials
5. Admin reviews profile and credentials
6. Admin clicks reject and enters reason
7. System updates coach verification status to REJECTED
8. System stores rejection reason in database
9. Rejection complete

### 2. Class Diagram (class.puml)

**Presentation Layer**
- **CoachVerificationPanel**: Admin interface for coach verification
  - Displays list of pending coaches
  - Shows coach profile details and credentials
  - Approve/reject buttons with reason input

**Controller Layer**
- **CoachController**: REST endpoints
  - GET /coaches - List coaches with filtering
  - GET /coaches/:id - Get coach details with credentials
  - PUT /coaches/:id/verify - Approve coach (admin only)
  - PUT /coaches/:id/reject - Reject coach (admin only)

**Service Layer**
- **CoachService**: Business logic
  - Queries coaches with filtering and pagination
  - Updates verification status
  - Activates user account on approval
  - Records rejection reason

**Entity Layer**
- **Coach**: Coach profile entity
  - bio, specialties, teachingMethods, yearOfExperience
  - verificationStatus (UNVERIFIED, VERIFIED, REJECTED)
  - verificationReason (stores rejection reason)
  - credentials: List of uploaded credentials

- **Credential**: Coaching credentials/certifications
  - name, type, description
  - publicUrl, issuedAt, expiresAt
  - Linked to coach

- **User**: User account linked to coach
  - isActive flag (activated on approval)

- **Role**: Admin role

**Enums**
- **CoachVerificationStatus**: UNVERIFIED, VERIFIED, REJECTED
- **CourseCredentialType**: CERTIFICATE, LICENSE, CERTIFICATION, AWARD

**Security Layer**
- **AuthGuard**: Verifies user is authenticated
- **RoleGuard**: Verifies user has admin role

## Coach Verification Workflow

### Step 1: View Pending Coaches

```
Admin Dashboard
    ↓
GET /coaches?filter=UNVERIFIED
    ↓
Filter by verificationStatus = UNVERIFIED
    ↓
Display list with pagination
```

### Step 2: View Coach Details

```
Admin clicks coach
    ↓
GET /coaches/:id
    ↓
Retrieve:
  - Coach profile (bio, specialties, experience)
  - All credentials (with images)
  - User info
    ↓
Display in verification panel
```

### Step 3: Approve Coach

```
Admin clicks APPROVE
    ↓
PUT /coaches/:id/verify
    ↓
Transaction:
  1. Update Coach:
     - verificationStatus = VERIFIED
  2. Update User:
     - isActive = true
    ↓
Success response
```

### Step 4: Reject Coach

```
Admin enters reason + clicks REJECT
    ↓
PUT /coaches/:id/reject
    ↓
Transaction:
  1. Update Coach:
     - verificationStatus = REJECTED
     - verificationReason = reason text
    ↓
Success response
```

## Verification Status States

| Status | Meaning | Next Actions |
|--------|---------|--------------|
| UNVERIFIED | Initial state after registration | Admin reviews and approves/rejects |
| VERIFIED | Admin approved credentials | Coach can create courses |
| REJECTED | Admin rejected credentials | Coach can resubmit with corrections |

## API Endpoints

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| GET | /coaches | - | Get all coaches (with filtering) |
| GET | /coaches/:id | - | Get specific coach details |
| PUT | /coaches/:id/verify | ADMIN | Approve coach profile |
| PUT | /coaches/:id/reject | ADMIN | Reject coach with reason |

## Request/Response Examples

### Approve Coach

```typescript
PUT /coaches/5/verify

Response:
{
  "message": "Coach profile verified successfully"
}
```

### Reject Coach

```typescript
PUT /coaches/5/reject

Body:
{
  "reason": "Credentials not properly documented. Please resubmit with official certification documents."
}

Response:
{
  "message": "Coach profile rejected successfully"
}
```

## Filtering Options

Coaches can be filtered by verification status:

```
GET /coaches?filter=UNVERIFIED  // Pending review
GET /coaches?filter=VERIFIED    // Approved coaches
GET /coaches?filter=REJECTED    // Rejected coaches
```

## What Admin Reviews

When reviewing a coach profile, admins check:

1. **Personal Information**
   - Full name, email, phone
   - Province and district
   - Account status

2. **Professional Profile**
   - Biography/professional summary
   - Specialties and expertise areas
   - Teaching methods
   - Years of experience

3. **Credentials**
   - Certification names and types
   - Issue and expiration dates
   - Supporting documents/images
   - Credential validity

4. **Account Status**
   - Email verification completed
   - Phone verification (if provided)
   - Account active/inactive

## Error Scenarios

| Error | Condition | Response |
|-------|-----------|----------|
| Unauthorized | User not authenticated | 401 Unauthorized |
| Forbidden | User not admin | 403 Forbidden |
| Not Found | Coach doesn't exist | 404 Not Found |
| Bad Request | Invalid reason length | 400 Bad Request |

## Transaction Safety

Both approve and reject operations use database transactions to ensure:
- All updates complete successfully together
- No partial state if operation fails
- Coach data remains consistent
- User account status matches verification status
