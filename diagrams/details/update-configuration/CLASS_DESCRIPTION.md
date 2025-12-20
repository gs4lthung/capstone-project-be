# Feature: Update Configuration

- Controller: `ConfigurationController.findAll(pagination, sort, filter)`, `ConfigurationController.updateConfiguration(id, data)`
- Service: `ConfigurationService.findAll(findOptions)`, `ConfigurationService.update(id, data)`
- Entities: `Configuration`, `User`, `Role`
- DTOs: `UpdateConfigurationDto`, `CreateConfigurationDto`
- Utilities: `AuthGuard`, `RoleGuard`, `DataSource`

Scope rules:
- Admin-only feature with role guard
- Configuration management with tracking of who updated
- Include repository operations and transaction for atomic updates
- Show authentication and authorization flow
- No note blocks; use inline method calls

## Class: ConfigurationController

```csv
Class,No,Method,Description
"ConfigurationController",01,"findAll(pagination, sort, filter): Promise<PaginateObject<Configuration>>","Retrieves all configurations with pagination and filtering"
"ConfigurationController",02,"findOne(key: string): Promise<CustomApiResponse<Configuration>>","Retrieves a specific configuration by key"
"ConfigurationController",03,"createConfiguration(data: CreateConfigurationDto): Promise<CustomApiResponse<void>>","Creates a new configuration (Admin only)"
"ConfigurationController",04,"updateConfiguration(id: number, data: UpdateConfigurationDto): Promise<CustomApiResponse<void>>","Updates an existing configuration (Admin only)"
```

## Class: ConfigurationService

```csv
Class,No,Method,Description
"ConfigurationService",01,"findAll(findOptions: FindOptions): Promise<PaginateObject<Configuration>>","Retrieves paginated list of configurations"
"ConfigurationService",02,"findByKey(key: string): Promise<CustomApiResponse<Configuration>>","Finds configuration by key"
"ConfigurationService",03,"create(data: CreateConfigurationDto): Promise<CustomApiResponse<void>>","Creates new configuration; sets createdBy and updatedBy to current user"
"ConfigurationService",04,"update(id: number, data: UpdateConfigurationDto): Promise<CustomApiResponse<void>>","Updates configuration; sets updatedBy to current user; returns 404 if not found"
```

## Class: AuthGuard

```csv
Class,No,Method,Description
"AuthGuard",01,"canActivate(context): boolean","Validates JWT token and authenticates user"
```

## Class: RoleGuard

```csv
Class,No,Method,Description
"RoleGuard",01,"canActivate(context): boolean","Checks if user has required role (ADMIN)"
```

## Class: Configuration

```csv
Class,No,Method,Description
"Configuration",-,"None","Entity representing system configuration with key value description dataType createdBy updatedBy"
```

## Class: User

```csv
Class,No,Method,Description
"User",-,"None","Entity representing platform user"
```

## Class: Role

```csv
Class,No,Method,Description
"Role",-,"None","Entity representing user role (ADMIN)"
```

## Class: UpdateConfigurationDto

```csv
Class,No,Method,Description
"UpdateConfigurationDto",-,"None","DTO carrying key? value? description? dataType?"
```

## Class: CreateConfigurationDto

```csv
Class,No,Method,Description
"CreateConfigurationDto",-,"None","DTO carrying key value description? dataType"
```
