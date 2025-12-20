# Feature: Manage Court

## Controllers

| Class | No | Method | Description |
|-------|----|--------------------|-------------|

### CourtController

| No | Method | Description |
|----|--------|-------------|
| 1 | findAll(pagination, sort, filter) | Get all courts with pagination, sorting, filtering (public access) |
| 2 | findOne(id) | Get specific court by ID (public access) |
| 3 | create(CreateCourtDto, file) | Create new court with optional image upload (Admin only) |
| 4 | update(id, UpdateCourtDto, file) | Update existing court with optional image replacement (Admin only) |
| 5 | delete(id) | Soft delete court by ID (Admin only) |
| 6 | restore(id) | Restore soft-deleted court by ID (Admin only) |

## Services

### CourtService

| No | Method | Description |
|----|--------|-------------|
| 1 | findAll(findOptions) | Query all courts with pagination, sorting, filtering |
| 2 | findOne(id) | Find court by ID (withDeleted: false) |
| 3 | create(CreateCourtDto, file) | Transaction: validate province/district, upload image to Bunny CDN, create court |
| 4 | update(id, UpdateCourtDto, file) | Transaction: validate court exists, update province/district if provided, upload new image if provided, update court |
| 5 | delete(id) | Transaction: verify court exists, soft delete court (set deletedAt) |
| 6 | restore(id) | Transaction: verify court is deleted, restore court (clear deletedAt) |

### BunnyService

| No | Method | Description |
|----|--------|-------------|
| 1 | uploadToStorage(file) | Upload court image to Bunny CDN storage, return public URL |

## Guards

### AuthGuard
Validates JWT token from request headers for create, update, delete, restore operations.

### RoleGuard
Verifies user has ADMIN role for create, update, delete, restore operations.

## DTOs

### CreateCourtDto
Properties: name (string, required, max 100), phoneNumber (string, optional, VN format), pricePerHour (number, required, min 0), publicUrl (string, optional, auto-assigned), address (string, required), latitude (number, optional), longitude (number, optional), provinceId (number, required), districtId (number, required)

### UpdateCourtDto
Properties: name (string, optional), phoneNumber (string, optional), pricePerHour (number, optional), publicUrl (string, optional, auto-assigned), address (string, optional), latitude (number, optional), longitude (number, optional), provinceId (number, optional), districtId (number, optional)

## Entities

### Court
Sports court/venue for courses. Properties: id, name, phoneNumber (unique), pricePerHour, publicUrl (image URL), address, latitude, longitude, province (ManyToOne Province, eager), district (ManyToOne District, eager), courses (OneToMany Course), createdAt, updatedAt, deletedAt.

### Province
Province/city for location. Properties: id, name, courts (OneToMany Court).

### District
District/ward for location. Properties: id, name, courts (OneToMany Court).

### Course
Course using court. Properties: id, court (ManyToOne Court).

## Scope Rules

- **Public Access**: View operations (findAll, findOne) are public, no authentication required
- **Admin Only**: Create, update, delete, restore operations restricted to ADMIN role
- **Role Guard**: Uses AuthGuard + RoleGuard with @Roles(UserRole.ADMIN) decorator
- **File Upload**: Uses multipart/form-data with FileInterceptor
  - Field name: `court_image`
  - File size limit: IMAGE enum limit
  - Storage: Bunny CDN
- **Image Management**:
  - Create: Optional image upload during creation
  - Update: Optional image replacement, old image URL not deleted from CDN
  - publicUrl stored in database after successful upload
- **Location Validation**:
  - Province and District must exist in database
  - Province and District are eagerly loaded with court
  - Location fields indexed for performance
- **Soft Delete**: 
  - Delete operation sets deletedAt timestamp
  - Deleted courts excluded from normal queries (withDeleted: false)
  - Can be restored via restore endpoint
- **Restore Validation**:
  - Verifies court exists with withDeleted: true
  - Verifies court actually has deletedAt set
  - Clears deletedAt to restore visibility
- **Pricing**: pricePerHour in numeric format (precision 15, scale 3)
- **GPS Coordinates**: Optional latitude/longitude for mapping (precision 10, scale 6)
- **Phone Number**: Optional, unique constraint, validated for VN format
- **Relations**: Courts can host multiple Course instances
- **CDN Integration**: All images stored on Bunny CDN with random ID generation
