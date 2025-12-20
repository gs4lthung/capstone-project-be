# Feature: Manage Base Credential

## Controllers

| Class | No | Method | Description |
|-------|----|--------------------|-------------|

### BaseCredentialController

| No | Method | Description |
|----|--------|-------------|
| 1 | findAll(pagination, sort, filter) | Get all base credentials with pagination, sorting, filtering |
| 2 | findOne(id) | Get specific base credential by ID |
| 3 | create(CreateBaseCredentialDto, file) | Create new base credential with optional image upload |
| 4 | update(id, UpdateBaseCredentialDto, file) | Update existing base credential with optional image replacement |
| 5 | delete(id) | Hard delete base credential by ID |

## Services

### BaseCredentialService

| No | Method | Description |
|----|--------|-------------|
| 1 | findAll(findOptions) | Query all base credentials with pagination, sorting, filtering |
| 2 | findById(id) | Find base credential by ID |
| 3 | create(CreateBaseCredentialDto, file) | Transaction: upload image to Bunny CDN, create credential |
| 4 | update(id, UpdateBaseCredentialDto, file) | Transaction: upload new image if provided, update credential |
| 5 | delete(id) | Transaction: hard delete base credential |

### BunnyService

| No | Method | Description |
|----|--------|-------------|
| 1 | uploadToStorage(file) | Upload credential image to Bunny CDN storage, return public URL |

## DTOs

### CreateBaseCredentialDto
Properties: name (string, 2-255 chars), description (string, optional), type (CourseCredentialType enum), publicUrl (string, optional, auto-assigned from upload)

### UpdateBaseCredentialDto
Properties: name (string, optional), description (string, optional), type (CourseCredentialType enum, optional), publicUrl (string, optional, auto-assigned from upload)

## Entities

### BaseCredential
Base credential template for courses. Properties: id, name, description, type (CourseCredentialType enum: CERTIFICATE/BADGE/LICENSE), publicUrl (image URL), credentials (OneToMany Credential), createdAt, updatedAt, deletedAt.

### Credential
Course-specific credential instances. Properties: id, baseCredential (ManyToOne BaseCredential), course, learner.

## Scope Rules

- **Public Access**: No authentication required for viewing credentials (used as reference data)
- **Admin Operations**: Create, update, delete operations typically restricted to admin users
- **File Upload**: Uses multipart/form-data with FileInterceptor
  - Field name: `base_credential_image`
  - File size limit: IMAGE enum limit
  - Storage: Bunny CDN
- **Image Management**:
  - Create: Optional image upload during creation
  - Update: Optional image replacement, old image URL not deleted
  - publicUrl stored in database after successful upload
- **Credential Types**: Enum-based validation (CERTIFICATE/BADGE/LICENSE)
- **Delete Behavior**: 
  - Hard delete (remove) - permanently deletes record
  - Entity has deletedAt column but service uses remove() not soft delete
- **Validation Rules**:
  - Name: 2-255 characters required
  - Description: 2+ characters optional
  - Type: Must be valid CourseCredentialType enum
  - publicUrl: Valid URL format when provided
- **Relations**: Base credentials can be used by multiple course-specific Credential instances
- **CDN Integration**: All images stored on Bunny CDN with random ID generation for uniqueness
