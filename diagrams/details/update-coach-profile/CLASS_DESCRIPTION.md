# Feature: Update Coach Profile

- Controller: `CoachController.update(data: UpdateCoachDto)`
- Service: `CoachService.update(data: UpdateCoachDto)`
- Entities: `Coach`, `Credential` (only if used)
- Scope: Method filtering per sequence; include ownership checks inline.
