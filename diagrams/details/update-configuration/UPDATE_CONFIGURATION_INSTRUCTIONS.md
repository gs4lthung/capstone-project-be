# Update Configuration Diagram Instructions

## Overview

The Update Configuration diagrams illustrate how administrators can manage system configuration values through the configuration management system.

For general class diagram guidelines, see: [`../CLASS_DIAGRAM_INSTRUCTIONS.md`](../CLASS_DIAGRAM_INSTRUCTIONS.md)

## Diagrams Included

### 1. Sequence Diagram (sequence.puml)

Shows the configuration management workflow:

**Retrieve Configurations (Steps 1-6)**
- Admin opens configuration panel
- Frontend requests GET /configurations
- ConfigurationController receives request and delegates to ConfigurationService
- ConfigurationService queries database for all configurations
- Returns paginated list of configurations
- Frontend displays configurations in UI

**Update Configuration (Steps 7-13)**
- Admin selects configuration and modifies value
- Frontend sends PUT request to /configurations/:id
- ConfigurationController:
  - Checks AuthGuard (user authenticated)
  - Checks RoleGuard (user is admin)
  - Delegates to ConfigurationService
- ConfigurationService:
  - Validates configuration exists
  - Updates configuration value
  - Records updatedBy user and timestamp
- Returns success response
- Frontend confirms update to admin

### 2. Class Diagram (class.puml)

**Presentation Layer**
- **ConfigurationPanel**: Admin interface for managing configurations
  - Displays list of configurations
  - Allows editing values
  - Shows success/error messages

**Controller Layer**
- **ConfigurationController**: REST endpoints
  - GET /configurations - Retrieve all configurations
  - GET /configurations/:key - Get specific configuration
  - POST /configurations - Create new configuration (admin only)
  - PUT /configurations/:id - Update configuration (admin only)

**Service Layer**
- **ConfigurationService**: Business logic
  - Queries configurations with pagination/filtering/sorting
  - Validates configuration data
  - Manages create/update operations
  - Tracks admin user changes

**Entity Layer**
- **Configuration**: Configuration entity
  - key: Unique identifier for configuration
  - value: Configuration value
  - dataType: Type of value (string, number, boolean, json)
  - createdBy/updatedBy: User audit trail
  - description: Configuration description

- **User**: User making changes
- **Role**: Admin role verification

**Security Layer**
- **AuthGuard**: Verifies user is authenticated
- **RoleGuard**: Verifies user has admin role

**Infrastructure**
- **DataSource**: Manages database transactions

## Configuration Data Types

| Type | Description | Example |
|------|-------------|---------|
| string | Text value | "api.timeout=30000" |
| number | Numeric value | "max.users=1000" |
| boolean | True/false value | "feature.analytics=true" |
| json | JSON object | "{"key": "value"}" |

## Configuration Management Workflow

### 1. Viewing Configurations

```
Admin → Client → GET /configurations
        ↓
        Controller (AuthGuard, RoleGuard)
        ↓
        Service (findAll with pagination)
        ↓
        Database
        ↓
        Return paginated list
```

### 2. Creating Configuration

```
Admin → Client → POST /configurations
        ↓
        Controller (AuthGuard, RoleGuard)
        ↓
        Service (validate and create)
        ↓
        Database (record createdBy)
        ↓
        Return success
```

### 3. Updating Configuration

```
Admin → Client → PUT /configurations/:id
        ↓
        Controller (AuthGuard, RoleGuard)
        ↓
        Service (find and update)
        ↓
        Database (record updatedBy)
        ↓
        Return success
```

## Access Control

| Endpoint | Auth Required | Role Required | Purpose |
|----------|---------------|---------------|---------|
| GET /configurations | No | No | Public view (read-only) |
| GET /configurations/:key | No | No | Public view specific config |
| POST /configurations | Yes | ADMIN | Create new configuration |
| PUT /configurations/:id | Yes | ADMIN | Update existing configuration |

## Admin Authentication

Admins authenticate using the same login flow as regular users. Refer to the [Login Feature](../login/CLASS_DIAGRAM_INSTRUCTIONS.md) for authentication details. The difference is:

- Admin users have the `ADMIN` role assigned in the database
- After login, the RoleGuard checks if user has admin role
- Non-admin users receive 403 Forbidden when accessing admin endpoints
- The system doesn't distinguish admin login endpoints from regular login

## Audit Trail

The system tracks who makes changes:

- **createdBy**: Admin user who created the configuration
- **updatedBy**: Admin user who last updated the configuration
- **createdAt**: Timestamp when created
- **updatedAt**: Timestamp when last modified

This allows administrators to see:
- Who created each configuration
- When it was last changed
- Who made the last change

## Error Scenarios

| Error | Condition | Response |
|-------|-----------|----------|
| Unauthorized | User not authenticated | 401 Unauthorized |
| Forbidden | User not admin | 403 Forbidden |
| Not Found | Configuration doesn't exist | 404 Not Found |
| Bad Request | Invalid data/type mismatch | 400 Bad Request |
| Conflict | Duplicate key | 409 Conflict |

## Best Practices

- Always use transactions for updates to ensure consistency
- Validate data types before saving
- Log all configuration changes for audit purposes
- Use meaningful configuration keys (e.g., "api.timeout", "feature.analytics")
- Document what each configuration does
- Implement rate limiting on configuration endpoints
- Cache frequently accessed configurations
- Consider requiring admin approval for sensitive configuration changes
