# Coach Verification Flow - Implementation Guide

## Overview
This document describes the actual coach verification workflow as implemented in the codebase. This is a simplified direct verification system without Request entities.

## Flow States

### Coach Verification Status
```
UNVERIFIED → VERIFIED
           ↓
        REJECTED
```

## Workflow Steps

### 1. Coach Registration
**Endpoint**: `POST /coaches/register`
**Status Change**: `none → UNVERIFIED`
**Implementation**: `apps/api-gateway/src/services/coach.service.ts` → `registerCoach()`

**Process**:
- Coach creates account with profile, credentials, and qualifications
- Initial status: `UNVERIFIED`
- Email/SMS verification sent if provided
- **Admin notification sent immediately** with title "Huấn luyện viên mới đăng ký"

**Business Logic**:
```typescript
// Validation:
✓ Email must be unique (if provided)
✓ Phone number must be unique (if provided)
✓ Password is hashed with bcrypt
✓ At least one of email or phoneNumber required

// System creates:
1. User entity with Coach role
2. Coach entity with UNVERIFIED status
3. Credential entities (uploaded to Bunny CDN)
4. Wallet entity with 0 balance
5. Notification sent to all admins immediately
```

### 2. Admin Review & Approve
**Endpoint**: `POST /coaches/:id/verify`
**Status Change**: `UNVERIFIED → VERIFIED`
**Implementation**: `apps/api-gateway/src/services/coach.service.ts` → `verifyCoach()`

**Business Logic**:
```typescript
// Input: coachId (number)

// System actions:
1. Find coach by ID
2. Update coach status to VERIFIED
3. Activate user account if not active
4. Send notification to coach (title: "Xác minh huấn luyện viên thành công")
5. Navigate to: /(coach)/menu/profile

// No Request entity involved
// No RequestAction audit trail
// Direct status update
```

### 3. Admin Reject with Reason
**Endpoint**: `POST /coaches/:id/reject`
**Status Change**: `UNVERIFIED → REJECTED`
**Implementation**: `apps/api-gateway/src/services/coach.service.ts` → `rejectCoach()`

**Business Logic**:
```typescript
// Input: coachId (number), reason (optional string)

// System actions:
1. Update coach status to REJECTED (direct update, no validation)
2. Send notification to coach with reason
3. Navigate to: /(coach)/menu/profile

// No Request entity involved
// Reason is optional (unlike documented flow)
// Notification body uses reason if provided, otherwise default message
```

**Notification Example**:

```text
Title: "Yêu cầu xác minh huấn luyện viên bị từ chối"
Body: "Thông tin chứng chỉ không rõ ràng" (if reason provided)
      OR "Từ chối xác minh huấn luyện viên" (default)
```

### 4. Coach Profile Update
**Endpoint**: `PUT /coaches/profile`
**Implementation**: `apps/api-gateway/src/services/coach.service.ts` → `update()`

**Business Logic**:

```typescript
// Coach can update when:
✓ Status is UNVERIFIED or REJECTED
✗ Status is VERIFIED (throws BadRequestException)

// Protection logic:
if (coach.verificationStatus === CoachVerificationStatus.VERIFIED) {
  throw new BadRequestException(
    'Không thể cập nhật hồ sơ huấn luyện viên đã được xác minh'
  );
}

// Updates credentials:
- Can update issuedAt, expiresAt dates
- Can change baseCredential reference
- Direct update (no request-based approval)
```

### 5. Get Coach Credentials
**Endpoint**: `GET /coaches/credentials` (authenticated coach)
**Implementation**: `apps/api-gateway/src/services/coach.service.ts` → `coachGetCredentials()`

Returns the coach's own credentials with base credential info.

## Key Features

### 1. Simple Direct Flow

- **No Request entity** - verification is direct status update
- **No audit trail** - only notifications sent
- **No RequestAction** - no historical tracking
- Admin receives notification immediately on registration
- Admin directly approves/rejects by coachId

### 2. Status Protection

```typescript
// UNVERIFIED:
✓ Can update profile freely
✓ Waiting for admin verification

// VERIFIED:
✗ Cannot update profile at all
✗ Blocked by BadRequestException

// REJECTED:
✓ Can update profile freely
✓ Can be re-verified by admin
```

### 3. Notification Flow

```text
Registration → Notify ALL admins immediately
Verify → Notify coach (success)
Reject → Notify coach (with optional reason)
```

### 4. No Re-submission Process

- Unlike the documented flow, there is **no submit-verification endpoint**
- Coach registers → Status becomes UNVERIFIED → Admin reviews
- If rejected, coach can update profile, but must wait for admin to re-verify
- **Coach cannot trigger re-verification themselves**

## Database Schema

### Coach Entity

```typescript
@Entity('coaches')
export class Coach {
  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: CoachVerificationStatus,
    default: CoachVerificationStatus.UNVERIFIED,
  })
  verificationStatus: CoachVerificationStatus; // UNVERIFIED, VERIFIED, REJECTED

  @ManyToOne(() => User)
  user: User;

  @OneToMany(() => Credential, (credential) => credential.coach)
  credentials: Credential[];
}
```

**Note**: No Request or RequestAction entities are used in this implementation.

## API Summary

| Method | Endpoint | Description | Access | Input |
|--------|----------|-------------|--------|-------|
| POST | `/coaches/register` | Create coach account | Public | RegisterCoachDto + files |
| POST | `/coaches/:id/verify` | Approve coach | Admin | coachId |
| POST | `/coaches/:id/reject` | Reject coach | Admin | coachId, reason? |
| PUT | `/coaches/profile` | Update profile | Coach | UpdateCoachProfileDto |
| GET | `/coaches/credentials` | Get own credentials | Coach | - |

## Role Responsibilities

### Coach Responsibilities

1. **Register** their account with profile, credentials, and qualifications
2. **Wait** for admin to review and verify
3. If rejected: **Update** profile and wait for admin to re-verify
4. **Cannot resubmit** verification themselves

### Admin Responsibilities

1. **Receive** notification immediately when coach registers
2. **Review** coach profile and credentials
3. **Verify** (approve) or **Reject** with optional reason
4. Can re-verify a rejected coach after they update their profile

## Error Handling

### Common Errors

```typescript
// Update profile:
"Không thể cập nhật hồ sơ huấn luyện viên đã được xác minh"
  (thrown when VERIFIED coach tries to update)

// General:
"Coach not found"
"Không tìm thấy hồ sơ huấn luyện viên"
"Email đã tồn tại"
"Số điện thoại đã tồn tại"
```

## Limitations of Current Implementation

1. **No Audit Trail**: No historical tracking of who approved/rejected
2. **No Request Entity**: No formal request workflow
3. **No Re-submission**: Coach cannot trigger re-verification after rejection
4. **No History**: Cannot view past verification attempts
5. **Simple Status Model**: Only UNVERIFIED/VERIFIED/REJECTED (no PENDING state)
6. **No Workflow Protection**: Admin can verify/reject at any time regardless of current status

## Comparison with Documented Flow

| Feature | Documented (OLD) | Actual Implementation |
|---------|------------------|----------------------|
| Request Entity | ✓ Used | ✗ Not used |
| Submit Verification | POST /coaches/submit-verification | ✗ Does not exist |
| Audit Trail | ✓ RequestAction table | ✗ Only notifications |
| PENDING Status | ✓ Used | ✗ Not used |
| Re-verification | Coach-initiated | Admin-initiated only |
| History Endpoint | GET /verification-history | ✗ Does not exist |
| Rejection Reason | Required | Optional |
