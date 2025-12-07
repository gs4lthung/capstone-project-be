# Update Coach Profile Diagram Instructions

## Overview

The Update Coach Profile diagrams illustrate the complete workflow for viewing and updating coach profiles, including profile information and credential management.

For general class diagram guidelines, see: [`../CLASS_DIAGRAM_INSTRUCTIONS.md`](../CLASS_DIAGRAM_INSTRUCTIONS.md)

## Diagrams Included

### 1. Sequence Diagram (sequence.puml)

Shows the complete workflow with two paths:

**Path A: View Own Profile and Update**
1. Coach browses coaches list
2. System queries and displays coaches
3. Coach selects own profile
4. System loads profile with details
5. Coach clicks "Edit Profile"
6. System displays editable form
7. Coach updates fields (bio, specialties, methods, experience)
8. Coach submits update
9. System:
   - Finds coach by authenticated user ID
   - Updates coach fields (partial update)
   - Saves to database
10. Update complete with success message
11. Coach adds new credential/certification
12. Coach fills credential details
13. Coach uploads credential with image file
14. System:
    - Uploads image to Bunny CDN
    - Gets public URL
    - Creates credential record
15. Credential added successfully

**Path B: View Other Coach Profile (Read-only)**
1. Coach browses coaches list
2. System queries and displays coaches
3. Coach selects another coach's profile
4. System loads profile with details
5. Coach views ratings
6. System:
    - Queries feedback for coach
    - Calculates average rating
    - Returns overall rating and count
7. Coach sees rating (e.g., 4.5/5 from 42 reviews)

### 2. Class Diagram (class.puml)

**Presentation Layer**
- **CoachListPanel**: Browse and search coaches
  - Display paginated list with filtering options
  - Sort by various criteria
  
- **CoachProfileCard**: Display coach details
  - Basic info (name, profile picture, bio)
  - Specialties and teaching methods
  - Experience level, verification status
  - Credentials list, courses offered
  - Overall rating (read-only)
  - Edit button (only for own profile)
  - Contact options

- **CoachProfileEditForm**: Update coach profile
  - Pre-filled form with current data
  - Edit bio, specialties, methods, experience
  - Submit updates
  
- **CredentialUploadPanel**: Manage certifications
  - List existing credentials
  - Upload new certificate images
  - Edit/delete credentials

**Controller Layer**
- **CoachController**: REST endpoints
  - GET /coaches - List coaches (paginated, filterable)
  - GET /coaches/:id - Get coach details
  - PUT /coaches/:id - Update own profile
  - GET /coaches/:id/rating/overall - Get coach rating
  - POST /coaches/credentials - Add credential
  - PUT /coaches/credentials/:id - Update credential
  - DELETE /coaches/credentials/:id - Delete credential
  - POST /coaches/credentials/:id/restore - Restore deleted
  - GET /coaches/credentials - Get own credentials

**Service Layer**
- **CoachService**: Business logic
  - findAll(options) - List coaches with pagination, sorting, filtering
  - findOne(id) - Get coach with relations
  - update(data) - Update authenticated coach's profile
  - getOverallRating(id) - Calculate average rating from feedbacks
  - uploadCredential(data, file) - Add credential with image
  - updateCredential(id, data, file) - Update credential
  - deleteCredential(id) - Soft delete credential
  - restoreCredential(id) - Restore deleted credential
  - coachGetCredentials() - Get authenticated coach's credentials

**Entity Layer**

- **Coach**: Coach profile entity
  - bio: Coaching description
  - specialties: Areas of expertise
  - teachingMethods: Teaching approach
  - yearOfExperience: Years coaching
  - verificationStatus: UNVERIFIED, VERIFIED, REJECTED
  - relations: user, credentials

- **User**: User account
  - fullName, email, phone, profilePicture
  - Verification status fields
  - isActive: Account active
  - lastLoginAt: Last login timestamp
  - role, coach (array), courses, enrollments

- **Credential**: Certification/qualification
  - name: Certificate name
  - type: CERTIFICATION, LICENSE, BADGE, DIPLOMA
  - publicUrl: CDN image URL
  - issuedAt, expiresAt: Dates
  - Soft delete support (deletedAt)

- **Feedback**: Student ratings
  - rating: 1-5 stars
  - comment: Review text
  - createdBy: Learner
  - receivedBy: Coach
  - session: Related session

- **Course**, **Session**, **Subject**, **Lesson**, **Video**, **Quiz**: Coach's course content
- **Enrollment**: Student enrollment in course

**DTOs**
- **UpdateCoachProfileDto**: Partial update (bio, specialties, methods, experience)
- **UpdateCredentialDto**: Partial update (name, type, dates, publicUrl)
- **RegisterCoachCredentialDto**: Create credential

**Enums**
- **CoachVerificationStatus**: UNVERIFIED, VERIFIED, REJECTED
- **CourseCredentialType**: CERTIFICATION, LICENSE, BADGE, DIPLOMA

## Coach Profile Update Workflow

### Step 1: View Profile

```
Coach/User browses coaches list
    ↓
GET /coaches (with pagination, sorting, filtering)
    ↓
System queries coaches
    ↓
Display coaches list with:
  - Name, profile picture
  - Bio snippet
  - Specialties
  - Rating badge
  - Verification status
```

### Step 2: Open Profile Details

```
User clicks on coach profile
    ↓
GET /coaches/:id
    ↓
System loads:
  - Coach entity with all fields
  - User information
  - Credentials list
  - Course count
    ↓
Display profile card with:
  - Full bio
  - Specialties and methods
  - Years of experience
  - Verification status
  - Credentials/certifications
  - Courses offered
  - Rating (if exists)
  - Contact options
```

### Step 3: Edit Own Profile (if owner)

```
Coach clicks "Edit Profile"
    ↓
System shows editable form (pre-filled)
    ↓
Coach updates fields:
  - Bio
  - Specialties (array)
  - Teaching methods (array)
  - Years of experience
    ↓
Coach submits update
    ↓
PUT /coaches/:id
    ↓
Service:
  1. Find coach by authenticated user ID
  2. Validate data
  3. Object.assign(coach, data)
  4. Save to database
    ↓
200 OK response
    ↓
Display success message
```

### Step 4: Manage Credentials

```
Coach clicks "Add Credential"
    ↓
System shows credential form
    ↓
Coach fills:
  - Credential name
  - Type (CERTIFICATION, LICENSE, BADGE, DIPLOMA)
  - Description (optional)
  - Issued date, expiry date
  - Certificate image file
    ↓
Coach submits
    ↓
POST /coaches/credentials (multipart/form-data)
    ↓
Service:
  1. Upload image to Bunny CDN
  2. Get public URL
  3. Create credential record
    ↓
200 OK response
    ↓
Credential added to list
```

### Step 5: View Ratings (Read-only)

```
User clicks "See Ratings"
    ↓
GET /coaches/:id/rating/overall
    ↓
Service:
  1. Query all feedback for coach
  2. Calculate average rating
  3. Count total reviews
    ↓
Response:
{
  "overall": 4.5,
  "total": 42
}
    ↓
Display: 4.5/5.0 stars (42 reviews)
```

## API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /coaches | Optional | List coaches (paginated, filterable) |
| GET | /coaches/:id | Optional | Get coach profile details |
| PUT | /coaches/:id | Required | Update own profile |
| GET | /coaches/:id/rating/overall | Optional | Get coach rating statistics |
| POST | /coaches/credentials | Required | Add credential |
| PUT | /coaches/credentials/:id | Required | Update credential |
| DELETE | /coaches/credentials/:id | Required | Delete credential (soft) |
| POST | /coaches/credentials/:id/restore | Required | Restore deleted credential |
| GET | /coaches/credentials | Required | Get own credentials |

## Request/Response Examples

### List Coaches

```typescript
GET /coaches?page=1&limit=10&sort=rating&filter=VERIFIED

Response 200 OK:
{
  "statusCode": 200,
  "data": {
    "data": [
      {
        "id": 1,
        "user": {
          "id": 1,
          "fullName": "Nguyễn A",
          "profilePicture": "https://...",
          "email": "coach@example.com"
        },
        "bio": "Professional pickleball coach with 10 years experience",
        "specialties": ["Beginner", "Intermediate"],
        "yearOfExperience": 10,
        "verificationStatus": "VERIFIED",
        "credentials": [...]
      }
    ],
    "meta": { "page": 1, "limit": 10, "total": 47 }
  }
}
```

### Get Coach Profile

```typescript
GET /coaches/1

Response 200 OK:
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "user": {
      "id": 1,
      "fullName": "Nguyễn A",
      "email": "coach@example.com",
      "profilePicture": "https://cdn.bunny.com/users/1/avatar.jpg",
      "isEmailVerified": true,
      "isActive": true
    },
    "bio": "Professional pickleball coach with 10 years experience",
    "specialties": ["Beginner", "Intermediate", "Advanced"],
    "teachingMethods": ["One-on-one", "Group sessions"],
    "yearOfExperience": 10,
    "verificationStatus": "VERIFIED",
    "credentials": [
      {
        "id": 1,
        "name": "IPA Certified Coach",
        "type": "CERTIFICATION",
        "publicUrl": "https://cdn.bunny.com/credentials/1/cert.jpg",
        "issuedAt": "2020-01-01",
        "expiresAt": "2025-12-31"
      }
    ]
  }
}
```

### Update Coach Profile

```typescript
PUT /coaches/1

Headers:
  Authorization: Bearer {token}

Body (partial):
{
  "bio": "Updated bio with new experience",
  "specialties": ["Beginner", "Intermediate", "Advanced"],
  "yearOfExperience": 11
}

Response 200 OK:
{
  "statusCode": 200,
  "message": "Cập nhật hồ sơ huấn luyện viên thành công",
  "data": null
}
```

### Get Coach Rating

```typescript
GET /coaches/1/rating/overall

Response 200 OK:
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "overall": 4.5,
    "total": 42
  }
}
```

### Add Credential

```typescript
POST /coaches/credentials

Headers:
  Authorization: Bearer {token}
  Content-Type: multipart/form-data

Body (form-data):
  name = "USPTA Certified Professional"
  type = "CERTIFICATION"
  description = "Professional coaching certification"
  issuedAt = "2020-01-01"
  expiresAt = "2025-12-31"
  credential_image = <certificate.jpg>

Response 200 OK:
{
  "statusCode": 200,
  "message": "Cập nhật giấy tờ thành công",
  "data": null
}
```

## Updatable Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bio | string | No | Coaching background and style |
| specialties | string[] | No | Areas of expertise |
| teachingMethods | string[] | No | How coach teaches |
| yearOfExperience | number | No | Years of coaching (0-80) |

All fields are optional (partial update).

## Credential Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Certificate name |
| type | enum | Yes | CERTIFICATION, LICENSE, BADGE, DIPLOMA |
| description | string | No | Certificate description |
| issuedAt | date | No | Issue date |
| expiresAt | date | No | Expiration date |
| publicUrl | string | No | CDN image URL |

## Verification Status

| Status | Meaning |
|--------|---------|
| UNVERIFIED | Coach registered, pending admin approval |
| VERIFIED | Coach approved, full access |
| REJECTED | Coach profile rejected |

Only verified coaches can fully use platform.

## Credential Types

| Type | Use Case |
|------|----------|
| CERTIFICATION | Professional certification |
| LICENSE | Official license |
| BADGE | Achievement badge |
| DIPLOMA | Academic diploma |

## Authorization

- **View Own Profile**: Authenticated coach
- **Edit Own Profile**: Only owner can update
- **View Other Profile**: Any user (read-only)
- **Add Credential**: Only own coach
- **Update Credential**: Only own credential (checked by user.id)
- **Delete Credential**: Only own credential (soft delete)
- **Restore Credential**: Only own credential

## Soft Delete Pattern

Credentials support soft delete:

```
DELETE /coaches/credentials/5
→ Sets deletedAt timestamp
→ Credential hidden by default

POST /coaches/credentials/5/restore
→ Clears deletedAt timestamp
→ Credential visible again
```

## Pagination

Default parameters:
- page: 1
- limit: 10
- maxLimit: 100

## Sorting Options

```
sort=rating      → By average rating (descending)
sort=experience  → By years (descending)
sort=created     → By registration date (newest)
sort=reviews     → By review count (descending)
```

## Filtering Options

```
filter=VERIFIED            → By verification status
specialties=beginner       → By specialties
minExperience=5            → By minimum experience
minRating=4.0              → By minimum rating
```

## Error Scenarios

| Error | Condition | Response |
|-------|-----------|----------|
| Unauthorized | Missing JWT token | 401 Unauthorized |
| Forbidden | Updating another coach | 403 Forbidden |
| Not Found | Coach doesn't exist | 404 Not Found |
| Not Found | Credential not found | 404 Not Found |
| Bad Request | Invalid data | 400 Bad Request |
| Bad Request | File too large | 400 Bad Request |

## Frontend Integration

### Coach List View

```html
<div class="coaches-list">
  <coach-card 
    *ngFor="let coach of coaches" 
    [coach]="coach"
    (selected)="viewProfile($event)">
  </coach-card>
  
  <pagination 
    [page]="page" 
    [total]="total"
    (change)="loadPage($event)">
  </pagination>
</div>
```

### Coach Profile View

```html
<div class="coach-profile">
  <div class="header">
    <img [src]="coach.user.profilePicture" class="avatar">
    <h1>{{ coach.user.fullName }}</h1>
    <span class="badge">{{ coach.verificationStatus }}</span>
    <button *ngIf="isOwnProfile" (click)="editProfile()">
      Edit Profile
    </button>
  </div>
  
  <div class="rating" *ngIf="rating">
    <star-rating [value]="rating.overall"></star-rating>
    <span>{{ rating.total }} reviews</span>
  </div>
  
  <div class="bio">{{ coach.bio }}</div>
  
  <div class="credentials">
    <h3>Certifications</h3>
    <credential-item 
      *ngFor="let cred of coach.credentials" 
      [credential]="cred"
      [editable]="isOwnProfile">
    </credential-item>
    
    <button *ngIf="isOwnProfile" (click)="addCredential()">
      Add Credential
    </button>
  </div>
</div>
```

### Profile Edit Form

```html
<form [formGroup]="profileForm" (ngSubmit)="onUpdate()">
  <textarea formControlName="bio" placeholder="Bio"></textarea>
  <input formControlName="specialties" placeholder="Specialties">
  <input formControlName="teachingMethods" placeholder="Methods">
  <input formControlName="yearOfExperience" type="number">
  
  <button type="submit" [disabled]="!profileForm.valid">
    Save Changes
  </button>
</form>
```

## Bunny CDN Integration

Credential images uploaded via Bunny:

```typescript
// Upload to Bunny
BunnyService.uploadToStorage({
  id: Date.now(),
  type: 'credential_image',
  filePath: file.path
})
// Returns public CDN URL
```

## Performance

- Coaches list paginated (max 100 per page)
- Credentials eager-loaded with coach
- Rating calculated on-demand (could be cached)
- Support for filtering and sorting at database level
