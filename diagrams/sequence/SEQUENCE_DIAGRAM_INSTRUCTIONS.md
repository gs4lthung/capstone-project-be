# Sequence Diagram Guidelines

This document provides instructions for creating and maintaining sequence diagrams in PlantUML format for the Capstone Project.

## Overview

Sequence diagrams show process interactions arranged in time sequence, depicting:
- Participants/actors involved
- Messages exchanged between them
- Order of interactions
- Decision points and alternatives

## PlantUML Syntax Reference

### Basic Structure

```plantuml
@startuml

participant "Actor/Component" as actor
participant "Another Component" as comp
database "Database" as db

actor -> comp: Message description
activate comp

comp -> db: Query
activate db
db --> comp: Data returned
deactivate db

comp --> actor: Response
deactivate comp

@enduml
```

### Key Elements

#### Participants
- **Actor**: `actor "Name" as alias`
- **Participant/Component**: `participant "Name" as alias`
- **Database**: `database "Name" as alias`
- **Boundary/System**: `boundary "Name" as alias`
- **Control/Process**: `control "Name" as alias`

#### Message Types

| Arrow Type | Syntax | Meaning |
|-----------|--------|---------|
| Synchronous call | `->` | Method call (caller waits) |
| Asynchronous | `-->` | Return message or async call |
| Create | `->` | Instantiate new object |
| Delete | `->` | Destroy object |
| Self-call | `->` | Message to self |

#### Activation Boxes
```plantuml
activate component      % Start execution
deactivate component    % End execution
```

### Conditional Logic

#### Alt (Alternative - if/else)
```plantuml
alt Condition 1
  message1 -> message2
else Condition 2
  message3 -> message4
end
```

#### Opt (Optional)
```plantuml
opt [Condition]
  message1 -> message2
end
```

#### Loop
```plantuml
loop [Repeat condition]
  message1 -> message2
end
```

#### Par (Parallel)
```plantuml
par [Parallel process 1]
  message1 -> message2
and [Parallel process 2]
  message3 -> message4
end
```

## Best Practices

### 1. **Naming Conventions**
- Use clear, descriptive names for participants
- Use lowercase aliases for shorter references
- Use multi-line names sparingly (only for long names)
  ```plantuml
  participant "Auth\nController" as controller
  ```

### 2. **Message Numbering**
- Number messages sequentially (1, 2, 3, etc.) for clarity
- Use format: `1. Action description`
- Helps readers follow the exact flow

### 3. **Message Details**
- Include parameter names and field names explicitly
- Don't use DTO class names, write out the actual fields
- Format: `{field1, field2, field3}` for objects
- Use `\n` for line breaks when message is long
- Example: `POST /auth/register\n{fullName, email, phoneNumber}`

### 4. **Activation Management**
- Use `activate` before a participant handles work
- Use `deactivate` when done
- Shows execution timeframe visually

### 5. **Error Handling**
- Use `alt` blocks for success/failure paths
- Keep error paths concise
- Show what the system does in each case

### 6. **Return Values**
- Use dashed arrows (`-->`) for returns
- For success: write simple message like "Success", "Data created", "Register success"
- For objects: show actual field names, not just DTO names
- Example: `{accessToken, refreshToken, user}` instead of `LoginResponseDto`

### 7. **Readability**
- Limit to 5-7 participants per diagram
- Keep message count under 20 steps
- Use meaningful message descriptions
- Add line breaks in long messages with `\n`

## Common Patterns

### Login/Authentication Flow
```plantuml
@startuml

actor "User" as user
participant "Client" as client
participant "Controller" as ctrl
participant "Service" as svc
database "DB" as db

user -> client: Enter credentials
client -> ctrl: POST /auth/login
activate ctrl

ctrl -> svc: login(credentials)
activate svc

svc -> db: Find user
activate db
db --> svc: User record
deactivate db

svc -> svc: Verify password
alt Invalid
  svc --> ctrl: Unauthorized
else Valid
  svc -> svc: Generate tokens
  svc -> db: Update tokens
  svc --> ctrl: Tokens + user data
end

deactivate svc
ctrl --> client: Response
deactivate ctrl

client --> user: Show result

@enduml
```

### CRUD Operation
```plantuml
@startuml

participant "Client" as client
participant "Controller" as ctrl
participant "Service" as svc
database "DB" as db

client -> ctrl: POST /resource
activate ctrl

ctrl -> svc: create(data)
activate svc

svc -> svc: Validate data
alt Validation fails
  svc --> ctrl: Bad request
else Valid
  svc -> db: Insert record
  svc --> ctrl: Created resource
end

deactivate svc
ctrl --> client: HTTP 201
deactivate ctrl

@enduml
```

### Error Handling
```plantuml
@startuml

participant "Client" as client
participant "Service" as svc
database "DB" as db

client -> svc: Execute action
activate svc

svc -> db: Query
activate db
db --> svc: Error / Data
deactivate db

alt Database error
  svc --> client: 500 Server error
else No data found
  svc --> client: 404 Not found
else Success
  svc --> client: 200 OK + data
end

deactivate svc

@enduml
```

## File Organization

```
diagrams/
├── sequence/
│   ├── login.puml                          # Authentication flow
│   ├── register.puml                       # User registration
│   ├── course-enrollment.puml              # Course enrollment flow
│   ├── payment.puml                        # Payment processing
│   └── SEQUENCE_DIAGRAM_INSTRUCTIONS.md    # This file
├── state-machine/
│   └── [state diagrams]
└── package/
    └── [package diagrams]
```

## Creating New Diagrams

### Steps:
1. **Identify the flow**: What's the main process?
2. **List participants**: Who/what is involved?
3. **Map interactions**: What messages are sent?
4. **Add conditions**: Where are decision points?
5. **Number steps**: Label for clarity
6. **Test rendering**: Ensure PlantUML parses correctly

### Template:
```plantuml
@startuml

participant "Actor" as actor
participant "Component 1" as comp1
participant "Component 2" as comp2
database "Database" as db

actor -> comp1: 1. Initial action
activate comp1

comp1 -> comp2: 2. Forward request
activate comp2

comp2 -> db: 3. Query data
activate db
db --> comp2: Data
deactivate db

comp2 --> comp1: 4. Response
deactivate comp2

comp1 --> actor: 5. Result
deactivate comp1

@enduml
```

## Diagram Naming Convention

- **Format**: `<process-name>.puml`
- **Examples**:
  - `login.puml`
  - `user-registration.puml`
  - `payment-processing.puml`
  - `course-enrollment.puml`

## Maintenance

- Update diagrams when process flows change
- Keep diagrams in sync with actual implementation
- Review during code reviews
- Document complex flows thoroughly

## Tools & Rendering

- **Format**: PlantUML
- **View online**: https://www.plantuml.com/plantuml/uml/
- **IDE Support**: Most IDEs have PlantUML extensions
- **Export**: PlantUML can export to PNG, SVG, PDF

## References

- [PlantUML Sequence Diagram Documentation](https://plantuml.com/sequence-diagram)
- [UML Sequence Diagrams](https://en.wikipedia.org/wiki/Sequence_diagram)
- [UML 2.5.1 Specification](https://www.omg.org/spec/UML/2.5.1/PDF)
