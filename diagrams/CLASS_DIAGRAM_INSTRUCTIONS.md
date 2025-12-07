# Class Diagram Instructions

## Overview

Class diagrams illustrate the architecture and relationships between components in a system.

## Layer Structure

### 1. Presentation Layer

Components that interact with users (UI, screens, forms)

- Handles user input and display
- Collects and validates user data
- Stores tokens and session information
- Manages navigation and redirects

### 2. Controller Layer

HTTP request handlers that route requests to services

- Receives HTTP requests from frontend
- Delegates business logic to services
- Returns responses to client
- Handles request validation and error handling

### 3. Service Layer

Core business logic implementation

- Implements business rules and operations
- Orchestrates interactions between entities
- Manages transactions and data consistency
- Handles authentication and authorization logic

### 4. Entity Layer (Database)

Data models and database entities

- Represents core business objects
- Defines relationships between entities
- Stores persistent data
- Enforces data integrity

### 5. Utility Layer

Helper services and external integrations

- JWT token generation and verification
- Configuration management
- External service integrations
- Cryptographic operations

## Data Flow Pattern

1. **Presentation** → User submits request through UI
2. **Controller** → HTTP endpoint receives request
3. **Service** → Processes business logic
4. **Entity** → Queries or updates database
5. **Utilities** → Performs cryptographic or configuration operations
6. **Response** → Returns result through controller to frontend

## Common Relationships

| Relationship Type | Meaning |
|------------------|---------|
| `-->` (uses/calls) | Class A uses or calls methods in class B |
| `--\|` (inherits) | Class A extends/inherits from class B |
| `--*` (composition) | Class A contains instance(s) of class B |
| `--o` (aggregation) | Class A has reference(s) to class B |
| `belongs to` | Entity relationship (one-to-many) |

## Naming Conventions

- **Controllers**: `<Feature>Controller` (e.g., AuthController, UserController)
- **Services**: `<Feature>Service` (e.g., AuthService, PaymentService)
- **Entities**: `<Feature>` (e.g., User, Order, Payment)
- **DTOs**: `<Feature><Dto>` (e.g., LoginRequestDto, UserResponseDto)
- **Utilities**: `<Feature>Service` (e.g., JwtService, ConfigService, MailService)

## Method Signature Guidelines

```typescript
// Service method
async methodName(param1: Type, param2: Type): Promise<ReturnType>

// Controller method
async methodName(data: DtoType): Promise<ResponseType>

// Utility method
methodName(param: Type): ReturnType
```

## Key Principles

- **Single Responsibility**: Each class has one reason to change
- **Dependency Injection**: Classes receive dependencies through constructor
- **Layering**: Dependencies flow downward (presentation → controller → service → entity)
- **Abstraction**: Use interfaces and abstract classes for flexibility
- **Composition**: Prefer composition over inheritance

## Best Practices

- Keep diagrams focused on one feature or workflow
- Group related classes by layer
- Show only essential relationships to reduce clutter
- Use consistent naming across layers
- Document complex interactions with notes
- Arrange classes left-to-right by flow direction

## Critical: Method Filtering for Feature-Specific Diagrams

**IMPORTANT**: Only show methods that are directly involved in the feature's workflow.

### How to Apply Method Filtering

1. **Review the sequence diagram** - Identify which methods are actually called in the feature's flow
2. **Remove unrelated methods** - If a service has many methods, only include those used by THIS feature
3. **Add ellipsis (...) notation** - Use ... at the end of the method list to indicate additional methods exist

### Example

**WRONG** - Shows ALL methods in CoachService:
`plantuml
class CoachService {
  --
  +registerCoach(data): Promise<Response>
  +findAll(options): Promise<Coach[]>
  +findOne(id): Promise<Coach>
  +update(data): Promise<void>
  +verifyCoach(id): Promise<void>
  +rejectCoach(id, reason): Promise<void>
  +uploadCredential(data, file): Promise<void>
  +updateCredential(id, data, file): Promise<void>
  +deleteCredential(id): Promise<void>
  +restoreCredential(id): Promise<void>
}
`

**CORRECT** - For "Update Coach Profile" feature, only show profile/credential methods:
`plantuml
class CoachService {
  --
  +findAll(options): Promise<Coach[]>
  +findOne(id): Promise<Coach>
  +update(data): Promise<void>
  +getOverallRating(id): Promise<RatingResponse>
  +uploadCredential(data, file): Promise<void>
  +updateCredential(id, data, file): Promise<void>
  ...
}
`

### Entity Filtering

Only include entities that are directly manipulated or displayed in the feature flow. Remove entities that are just related but not part of this specific feature.

**WRONG** - "Update Coach Profile" includes Course entities (not involved):
`
Coach --> Course (has many)
User --> Enrollment (has many)
Course --> Session (has many)
`

**CORRECT** - Only include Credential and Feedback (used in feature):
`
Coach --> Credential (has many)
Coach --> Feedback (received)
User --> Feedback (gives)
`

### Quick Checklist Before Creating a Diagram

- [ ] Reviewed feature sequence diagram to identify called methods?
- [ ] Service shows ONLY those called methods + ellipsis?
- [ ] No unrelated entities included (remove non-feature entities)?
- [ ] Controller/Service method signatures match actual code?
- [ ] DTOs and Enums are feature-specific only?
- [ ] Entity relationships only show feature-relevant connections?
