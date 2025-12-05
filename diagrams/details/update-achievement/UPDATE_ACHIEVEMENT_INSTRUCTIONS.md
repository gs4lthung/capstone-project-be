# Update Achievement Diagram Instructions

## Overview

The Update Achievement diagrams illustrate the admin workflow for editing existing achievements with support for three achievement types (Event Count, Streak, Property Check) and optional icon updates via Bunny CDN.

For general class diagram guidelines, see: [`../CLASS_DIAGRAM_INSTRUCTIONS.md`](../CLASS_DIAGRAM_INSTRUCTIONS.md)

## Diagrams Included

### 1. Sequence Diagram (sequence.puml)

Shows the complete workflow for updating an achievement:

1. Admin views achievement list
2. System queries all achievements from database
3. Admin selects achievement to edit
4. System displays edit form with current values
5. Admin updates one or more fields
6. Admin optionally selects new icon image
7. Admin submits form
8. System:
   - Validates request and admin role
   - Finds achievement by ID and type
   - If icon provided: uploads to Bunny CDN, gets new URL
   - If no icon: keeps existing icon
   - Applies updates to achievement object (partial update)
   - Saves changes to database
9. Confirmation message displayed

### 2. Class Diagram (class.puml)

**Presentation Layer**
- **AchievementEditPanel**: Admin interface for editing achievements
  - Display achievement details in editable form
  - Show current icon and allow replacement
  - Support editing fields per achievement type
  - Submit and validation

**Controller Layer**
- **AchievementController**: REST endpoints
  - PUT /achievements/event-count/:id - Update event count type
  - PUT /achievements/streak/:id - Update streak type
  - PUT /achievements/property-check/:id - Update property check type
  - All support file upload for new icon

**Service Layer**
- **AchievementService**: Business logic
  - updateEventCount(id, data, icon?) - Update event count achievement
  - updateStreak(id, data, icon?) - Update streak achievement
  - updatePropertyCheck(id, data, icon?) - Update property check achievement
  - Common logic: icon upload, validation, Object.assign, save
  
- **BunnyService**: File storage integration
  - uploadToStorage(icon) - Upload icon to Bunny CDN
  - Returns new icon URL

**Entity Layer**

Three achievement types using Single Table Inheritance:

- **Achievement**: Base class
  - id, name, description
  - iconUrl (nullable, can be updated)
  - isActive (toggle on/off without delete)
  - createdAt, createdBy

- **EventCountAchievement**: Extends Achievement
  - eventName: Name of event to count
  - targetCount: Number to reach

- **StreakAchievement**: Extends Achievement
  - eventName: Event that builds streak
  - targetStreakLength: Length to maintain
  - streakUnit: days, weeks, or months

- **PropertyCheckAchievement**: Extends Achievement
  - eventName: Trigger event
  - entityName: Which entity to check
  - propertyName: Which property to examine
  - comparisonOperator: ==, !=, >, <, >=, <=
  - targetValue: Value to compare against

**DTOs (Update)**
- **UpdateEventCountAchievementDto**: Partial fields (name, description, eventName, targetCount, isActive, iconUrl)
- **UpdateStreakAchievementDto**: Partial fields (name, description, eventName, targetStreakLength, streakUnit, isActive, iconUrl)
- **UpdatePropertyCheckAchievementDto**: Partial fields (name, description, eventName, entityName, propertyName, comparisonOperator, targetValue, isActive, iconUrl)

**Security Layer**
- **AuthGuard**: Verifies user is authenticated
- **RoleGuard**: Verifies user has admin role

## Achievement Update Workflow

### Step 1: View Achievement List

```
Admin Dashboard
    ↓
GET /achievements
    ↓
Query all achievements (paginated/filtered)
    ↓
Display list with edit/delete actions
```

### Step 2: Open Edit Form

```
Admin clicks EDIT on achievement
    ↓
GET /achievements/:id (or from list response)
    ↓
Display form pre-filled with:
  - Name, description
  - Type-specific fields (eventName, targetCount, etc.)
  - Current icon
  - Active/inactive toggle
```

### Step 3: Update Achievement

```
Admin modifies fields
    ↓
Admin optionally selects new icon
    ↓
Admin clicks SAVE
    ↓
PUT /achievements/[type]/:id
    ↓
Service Logic:
  1. Find achievement in database
  2. If icon file provided:
     a. Upload to Bunny CDN
     b. Get new iconUrl
     c. Update data.iconUrl
  3. Merge updates: Object.assign(achievement, data)
  4. Save to database
  5. Return success
    ↓
Client displays success message
```

### Step 4: Error Handling

If achievement not found:
```
BadRequestException: "Achievement not found"
Response 400 Bad Request
```

If invalid data:
```
ValidationError (via ValidationPipe)
Response 400 Bad Request with constraint violations
```

If Bunny upload fails:
```
Log error but don't throw
Keep existing icon, complete update without new icon
Response 200 OK (non-critical operation failure)
```

## Updatable Fields by Type

### Event Count Achievement

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Achievement name (2-100 chars) |
| description | string | No | Achievement description |
| iconUrl | string | No | Icon URL (uploaded via Bunny) |
| eventName | string | No | Event name to count (EVENT_COUNT, etc.) |
| targetCount | number | No | Target count to reach |
| isActive | boolean | No | Enable/disable achievement |

### Streak Achievement

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Achievement name (2-100 chars) |
| description | string | No | Achievement description |
| iconUrl | string | No | Icon URL |
| eventName | string | No | Event that builds streak |
| targetStreakLength | number | No | Length to maintain |
| streakUnit | string | No | days \| weeks \| months |
| isActive | boolean | No | Enable/disable achievement |

### Property Check Achievement

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Achievement name (2-100 chars) |
| description | string | No | Achievement description |
| iconUrl | string | No | Icon URL |
| eventName | string | No | Event trigger |
| entityName | string | No | Entity to check |
| propertyName | string | No | Property name |
| comparisonOperator | string | No | ==, !=, >, <, >=, <= |
| targetValue | string | No | Value to compare |
| isActive | boolean | No | Enable/disable achievement |

## API Endpoints

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| PUT | /achievements/event-count/:id | ADMIN | Update event count type |
| PUT | /achievements/streak/:id | ADMIN | Update streak type |
| PUT | /achievements/property-check/:id | ADMIN | Update property check type |

## Request/Response Examples

### Update Event Count Achievement

```typescript
PUT /achievements/event-count/5

Headers:
  Content-Type: multipart/form-data
  Authorization: Bearer {token}

Body (form-data):
  name = "Lesson Master"
  targetCount = 100
  icon = <file.png>

Response 200 OK:
{
  "statusCode": 200,
  "message": "ACHIEVEMENT.UPDATE_SUCCESS",
  "data": null
}
```

### Update Streak Achievement (no icon)

```typescript
PUT /achievements/streak/12

Headers:
  Authorization: Bearer {token}

Body (JSON):
{
  "targetStreakLength": 14,
  "streakUnit": "days",
  "isActive": false
}

Response 200 OK:
{
  "statusCode": 200,
  "message": "ACHIEVEMENT.UPDATE_SUCCESS",
  "data": null
}
```

### Update Property Check Achievement

```typescript
PUT /achievements/property-check/8

Headers:
  Authorization: Bearer {token}

Body (JSON):
{
  "description": "Complete profile with verified badge",
  "comparisonOperator": "==",
  "targetValue": "true"
}

Response 200 OK:
{
  "statusCode": 200,
  "message": "ACHIEVEMENT.UPDATE_SUCCESS",
  "data": null
}
```

## Icon Upload Flow

When icon file is provided:

```
1. Express receives multipart/form-data
   ↓
2. FileInterceptor extracts 'icon' field
   ↓
3. File saved to temp storage (Express)
   ↓
4. Service.updateXxx() called with icon param
   ↓
5. Bunny upload with:
   - File path from disk
   - Type: 'icon'
   - Unique ID (timestamp)
   ↓
6. Bunny returns CDN URL
   ↓
7. data.iconUrl = new URL
   ↓
8. Object.assign updates achievement
   ↓
9. Database save
   ↓
10. Temp file cleanup (automatic)
```

If upload fails:
- Error logged to console
- Service continues without throwing
- Achievement updated with old icon
- Response still 200 OK

This ensures partial update success if icon upload fails.

## Validation Rules

### Name
- String type
- Minimum 2 characters
- Maximum 100 characters

### Description
- String type (optional)
- Can be empty or null

### Icon URL
- Must be valid URL format
- Optional
- Typically HTTPS

### Event Name
- String type
- Depends on available events in system

### Comparison Operator (PropertyCheck)
- Must be one of: `==`, `!=`, `>`, `<`, `>=`, `<=`
- Throws BadRequestException if invalid

### Streak Unit
- One of: `days`, `weeks`, `months`

### Target Values
- targetCount: number (positive)
- targetStreakLength: number (positive)
- targetValue: string (compared as-is)

## Single Table Inheritance

All achievement types use single table inheritance with discriminator column:

```sql
CREATE TABLE achievements (
  id INT PRIMARY KEY,
  type ENUM('EVENT_COUNT', 'STREAK', 'PROPERTY_CHECK'),
  name VARCHAR(100),
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  -- EVENT_COUNT fields
  event_name VARCHAR(100),
  target_count INT,
  -- STREAK fields
  target_streak_length INT,
  streak_unit VARCHAR(20),
  -- PROPERTY_CHECK fields
  entity_name VARCHAR(100),
  property_name VARCHAR(100),
  comparison_operator VARCHAR(5),
  target_value VARCHAR(255),
  -- Base fields
  created_at TIMESTAMP,
  created_by INT
);
```

Update repository uses type-specific repository (EventCountAchievementRepository, etc.) but queries same table.

## Partial Update Pattern

Updates use **partial update** pattern:

```typescript
// Only fields in data are updated
// Omitted fields retain existing values
Object.assign(achievement, data);

// If data has { name: "New Name" }
// Only name changes, other fields unchanged
```

This allows:
- Updating single field without affecting others
- Optional file upload without modifying other fields
- Flexible API for front-end

## Error Scenarios

| Error | Condition | Response |
|-------|-----------|----------|
| Unauthorized | Missing JWT token | 401 Unauthorized |
| Forbidden | User not admin | 403 Forbidden |
| Not Found | Achievement ID doesn't exist | 400 Bad Request |
| Bad Request | Invalid comparison operator | 400 Bad Request |
| Bad Request | Invalid update data | 400 Bad Request |
| Server Error | Bunny upload fails (non-blocking) | 200 OK (icon not updated) |

## Bunny CDN Integration

Update uses **Bunny Storage** for icon hosting:

```typescript
// Upload parameters
{
  id: Date.now(),           // Unique identifier
  type: 'icon',             // File category
  filePath: icon.path       // Temp file path
}

// Returns
iconUrl: "https://cdn.bunny.com/achievements/{id}/icon.png"
```

Benefits:
- Fast CDN delivery
- Separate storage from database
- Automatic cleanup (per Bunny config)
- Bandwidth optimization

## Frontend Integration

### Form Fields

```html
<form [formGroup]="updateForm" (ngSubmit)="onSubmit()">
  <input type="text" formControlName="name">
  <textarea formControlName="description"></textarea>
  
  <!-- Type-specific fields shown conditionally -->
  
  <input type="file" #iconUpload accept="image/*">
  <button type="button" (click)="selectIcon()">
    Choose Icon
  </button>
  
  <button type="submit" [disabled]="!updateForm.valid">
    Save Changes
  </button>
</form>
```

### Success/Error Messages

```typescript
onSubmit() {
  const formData = new FormData();
  
  // Add form fields
  Object.entries(this.updateForm.value).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  // Add icon if selected
  if (this.selectedFile) {
    formData.append('icon', this.selectedFile);
  }
  
  this.achievementService
    .update(this.achievementId, this.achievementType, formData)
    .subscribe(
      () => this.showSuccess(),
      (err) => this.showError(err)
    );
}
```
