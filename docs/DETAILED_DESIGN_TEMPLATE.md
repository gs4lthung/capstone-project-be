# 3. Detailed Design

## 3.1 <Feature/Function Name>
[Provide the detailed design for the feature. It includes Class Diagram, Class Specifications, and Sequence Diagram(s). For features/functions with the same structure, present diagrams once and reference them from other features/functions.]

### 3.1.1 Class Diagram
- Location: `diagrams/details/<feature>/class.puml`
- Rules:
  - Follow `diagrams/CLASS_DIAGRAM_INSTRUCTIONS.md` (layering, method filtering, repository layer, transactions, naming)
  - Use PlantUML only; no Draw.io notes/blocks
  - Do NOT include attributes in the class diagram; list them in `CLASS_SPEC.md` instead

### 3.1.1.1 Class Specifications
Provide concise specs for each class shown in the diagram:
- Controller: endpoints, input DTOs, responses
- Service: methods invoked by the feature, transactions/ownership checks
- Entities: fields/relations used by the feature (no unrelated ones)
- DTOs: fields used in requests/responses
- Utilities: external services used (JwtService, ConfigService, etc.)

Reference file: `diagrams/details/<feature>/CLASS_DESCRIPTION.md`

### 3.1.2 <Sequence Diagram Name 1>
- Location: `diagrams/details/<feature>/sequence.puml`
- Rules:
  - Use specific instance names (e.g., `QuizController`, `QuizService`, `LessonRepository`, `PostgreSQL`)
  - Always include repository layer with explicit params and `relations`
  - Show transaction boundaries (start/commit) and each repository operation
  - Ownership verification inline as method call (no note blocks)

### 3.1.3 <Sequence Diagram Name 2>
- Location: `diagrams/details/<feature>/sequence-<variant>.puml`
- Apply the same rules as 3.1.2

### 3.1.4 Reuse Guidance
- If multiple features share identical structure, author diagrams once under the primary feature and add cross-references in other features’ `CLASS_DESCRIPTION.md`
- Mark not-yet-implemented flows as `FUTURE` and reference `diagrams/DIAGRAM_AUDIT_REPORT.md` for implementation status

### 3.1.5 Validation Checklist
- Class methods match actual codebase signatures
- Only feature-relevant entities/DTOs are included
- Repository calls include `relations` where loading relations
- Transactions and ownership verifications shown explicitly

### 3.1.6 Related References
- Class diagram rules: `diagrams/CLASS_DIAGRAM_INSTRUCTIONS.md`
- Audit priorities: `diagrams/DIAGRAM_AUDIT_REPORT.md`
- Optional converter: `diagrams/plantuml_to_drawio_xml.pl` (use only if requested)
