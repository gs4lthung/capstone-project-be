# Register Diagram Instructions

## Overview

The Register diagrams illustrate the complete user registration and email verification flow in the authentication system.

For general class diagram guidelines, see: [`../CLASS_DIAGRAM_INSTRUCTIONS.md`](../CLASS_DIAGRAM_INSTRUCTIONS.md)

## Diagrams Included

### 1. Sequence Diagram (sequence.puml)

Shows the step-by-step interaction between components during registration:

**Registration Phase (Steps 1-11)**
- User fills registration form with all required details
- Frontend sends POST request to AuthController
- AuthController validates input and delegates to AuthService
- AuthService checks for duplicate email/phone
- Password is hashed using bcrypt
- New User entity created with:
  - Email/phone verification flags set to false
  - Learner profile with skill level and learning goal
  - Wallet initialized with 0 balance
- Email verification token generated (if email provided)
- Verification email sent via MailService
- SMS verification code sent via TwilioService
- Success response returned to frontend

**Email Verification Phase (Steps 12-20)**
- User clicks verification link from email
- Frontend calls GET /auth/verify-email?token=...
- AuthService verifies JWT token validity
- User record updated with:
  - isEmailVerified = true
  - isActive = true
  - emailVerificationToken cleared
- Redirect to client app success page

### 2. Class Diagram (class.puml)

**Presentation Layer**
- **RegisterScreen**: Frontend component with form fields for all registration data

**Controller Layer**
- **AuthController**: Handles registration and verification endpoints

**Service Layer**
- **AuthService**: Orchestrates registration process, password hashing, token generation, email/SMS sending

**Entity Layer**
- **User**: Core user entity with verification flags and tokens
- **Learner**: Learner profile with skill level and learning goal
- **Wallet**: User's financial wallet initialized on registration
- **Role**: User's role assignment (defaults to Learner)

**Utility Layer**
- **JwtService**: Generates email verification tokens
- **MailService**: Sends verification emails
- **TwilioService**: Sends SMS verification codes
- **ConfigService**: Provides configuration values

## Key Data Requirements

### RegisterRequestDto Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| fullName | string | Yes | User's full name |
| email | string | Conditional | Required if phoneNumber not provided |
| phoneNumber | string | Conditional | Required if email not provided (Vietnam format) |
| password | string | Yes | Must be strong (8+ chars, uppercase, lowercase, number, symbol) |
| province | number | Yes | Province ID for location |
| district | number | Yes | District ID for location |
| learner | CreateLearnerDto | Yes | Skill level and learning goal |

### CreateLearnerDto Fields

| Field | Type | Required | Values |
|-------|------|----------|--------|
| skillLevel | enum | Yes | BEGINNER, INTERMEDIATE, ADVANCED |
| learningGoal | enum | Yes | BEGINNER, INTERMEDIATE, ADVANCED |

## Registration Flow Steps

1. **Form Submission**
   - User provides all required registration data
   - Frontend validates form locally
   - POST request sent to `/auth/register`

2. **Validation**
   - Check email not already registered
   - Check phone not already registered
   - Validate email format (if provided)
   - Validate phone format for Vietnam

3. **User Creation**
   - Hash password with bcrypt
   - Create User entity with isActive = false
   - Create Learner profile with skill level and learning goal
   - Create Wallet with 0 balance
   - Assign Learner role

4. **Verification Setup**
   - If email: Generate verification token, send email
   - If phone: Send SMS code via Twilio
   - Save email verification token to User entity

5. **Email Verification** (separate flow)
   - User clicks email link with token
   - Verify JWT token signature and expiration
   - Mark email as verified
   - Set isActive = true
   - Clear verification token

## Error Scenarios

| Error | Condition | Response |
|-------|-----------|----------|
| Conflict | Email already exists | 409 Conflict |
| Conflict | Phone already exists | 409 Conflict |
| Bad Request | Password too weak | 400 Bad Request |
| Bad Request | Invalid email format | 400 Bad Request |
| Bad Request | Invalid phone format | 400 Bad Request |
| Unauthorized | Invalid verification token | 401 Unauthorized |
| Not Found | User not found during verification | 404 Not Found |

## Security Considerations

- **Password Hashing**: All passwords hashed with bcrypt before storage
- **Verification Tokens**: Short-lived JWT tokens for email verification
- **Phone Verification**: SMS codes expire after short period
- **Account Status**: New accounts inactive until email verified
- **Strong Password**: Enforced at controller level with validation
- **Rate Limiting**: Consider implementing on registration endpoint
