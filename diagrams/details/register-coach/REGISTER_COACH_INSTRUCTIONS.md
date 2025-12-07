# Register Coach Diagram Instructions

## Overview

The Register Coach diagrams illustrate the complete coach registration process, credential uploading, and verification flow.

For general class diagram guidelines, see: [`../CLASS_DIAGRAM_INSTRUCTIONS.md`](../CLASS_DIAGRAM_INSTRUCTIONS.md)

## Diagrams Included

### 1. Sequence Diagram (sequence.puml)

Shows the step-by-step interaction during coach registration:

**Registration Phase (Steps 1-12)**
- Coach candidate fills registration form with personal and professional details
- Frontend sends POST request to CoachController
- CoachController delegates to CoachService
- CoachService validates:
  - Email not already registered
  - Phone not already registered
- Password hashed using bcrypt
- New User entity created with:
  - Coach role assigned
  - Coach entity created with verificationStatus = UNVERIFIED
  - Email/phone verification flags set to false
- Email verification token generated (if email provided)
- Verification email sent via MailService
- SMS verification code sent via TwilioService
- Success response returned with message to add credentials

**Credential Upload Phase (Steps 13-19)**
- Coach uploads credentials (certificates, certifications, licenses)
- For each credential:
  - Name, type, issue/expiration dates
  - Credential image file uploaded
- CoachService validates file (format, size)
- Credential entity created and linked to Coach
- Credentials stored for admin verification
- Coach waits for admin to verify registration

**Email Verification Phase (Steps 20-28)**
- Coach clicks email verification link
- Frontend calls GET /auth/verify-email?token=...
- AuthService verifies JWT token validity
- User record updated with isEmailVerified = true, isActive = true
- Coach profile creation complete
- Coach status awaits admin verification

### 2. Class Diagram (class.puml)

**Presentation Layer**
- **RegisterCoachScreen**: Frontend component with:
  - Personal info (fullName, email, phoneNumber, password)
  - Location (province, district)
  - Coach profile (bio, specialties, teaching methods, experience)
  - Credential upload interface

**Controller Layer**
- **CoachController**: Handles coach registration and credential management
- **AuthController**: Handles email verification

**Service Layer**
- **CoachService**: Orchestrates coach registration, credentials, verification
- **AuthService**: Manages email verification

**Entity Layer**
- **User**: Core user entity with verification flags
- **Coach**: Coach profile with bio, specialties, teaching methods, experience, credentials, verification status
- **Credential**: Individual credentials/certifications with type, dates, image
- **Role**: User role (Coach in this case)

**Utility Layer**
- **JwtService**: Generates email verification tokens
- **MailService**: Sends verification emails
- **TwilioService**: Sends SMS verification codes
- **BunnyService**: Uploads and manages credential images
- **ConfigService**: Provides configuration values

## Key Data Requirements

### RegisterCoachDto Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| fullName | string | Yes | Coach's full name |
| email | string | Conditional | Required if phoneNumber not provided |
| phoneNumber | string | Conditional | Required if email not provided (Vietnam format) |
| password | string | Yes | Must be strong (8+ chars, uppercase, lowercase, number, symbol) |
| province | number | Yes | Province ID for location |
| district | number | Yes | District ID for location |
| coach | CoachProfileDto | Yes | Bio, specialties, teaching methods, experience, credentials |

### CoachProfileDto Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| bio | string | Yes | Professional biography/summary |
| specialties | string[] | No | Areas of expertise |
| teachingMethods | string[] | No | Teaching methodologies (Online, In-person, etc.) |
| yearOfExperience | number | Yes | Years of coaching experience (0-80) |
| credentials | Credential[] | No | Initial credentials to upload |

### RegisterCoachCredentialDto Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | Yes | Credential name/title |
| type | CourseCredentialType | Yes | Type (USPTA, NTRP, License, etc.) |
| description | string | No | Additional credential details |
| issuedAt | Date | No | Date credential was issued |
| expiresAt | Date | No | Credential expiration date |
| publicUrl | string | No | Public URL to credential |

## Coach Verification Status

The coach has different verification states:

| Status | Meaning | Next Step |
|--------|---------|-----------|
| UNVERIFIED | Initial state after registration | Wait for email verification |
| VERIFIED | Email verified, profile active | Admin reviews credentials |
| PENDING | Admin reviewing credentials | Admin approves/rejects |
| APPROVED | Admin approved all credentials | Coach can create courses |
| REJECTED | Admin rejected credentials | Coach can resubmit or contact support |

## Registration Flow Steps

1. **Form Submission**
   - Coach provides personal info, location, professional details
   - Includes initial credentials (optional)
   - POST request to `/coaches/register`

2. **Validation**
   - Check email not already registered
   - Check phone not already registered
   - Validate email format
   - Validate phone format for Vietnam
   - Validate password strength

3. **Coach Creation**
   - Hash password with bcrypt
   - Create User entity with Coach role
   - Create Coach entity with:
     - Profile details (bio, specialties, teaching methods, experience)
     - verificationStatus = UNVERIFIED
   - Create Wallet initialized with 0 balance

4. **Verification Setup**
   - If email: Generate verification token, send email
   - If phone: Send SMS code via Twilio
   - Save verification token to User entity

5. **Email Verification** (separate flow)
   - Coach clicks email link with token
   - Verify JWT token signature and expiration
   - Mark email as verified
   - Set isActive = true
   - Clear verification token

6. **Credential Management**
   - Coach uploads credentials one by one
   - Each credential includes:
     - Name, type, description
     - Issue and expiration dates
     - Credential image file
   - Images stored on Bunny CDN
   - Credentials linked to Coach entity

## Error Scenarios

| Error | Condition | Response |
|-------|-----------|----------|
| Bad Request | Email already exists | 400 Bad Request |
| Bad Request | Phone already exists | 400 Bad Request |
| Bad Request | Password too weak | 400 Bad Request |
| Bad Request | Invalid email format | 400 Bad Request |
| Bad Request | Invalid phone format | 400 Bad Request |
| Bad Request | Invalid file type (credential) | 400 Bad Request |
| Bad Request | File too large | 400 Bad Request |
| Not Found | Coach role not found | 404 Not Found |
| Unauthorized | Invalid verification token | 401 Unauthorized |

## Security Considerations

- **Password Hashing**: All passwords hashed with bcrypt before storage
- **Verification Tokens**: Short-lived JWT tokens for email verification
- **Phone Verification**: SMS codes expire after short period
- **Account Status**: New coach accounts inactive until email verified
- **Credential Verification**: Admin must approve credentials before coach can create courses
- **File Upload**: Credential images validated for format and size
- **Rate Limiting**: Consider implementing on registration endpoint
