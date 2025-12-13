# Feature: Login

- Presentation: `LoginScreen` submits credentials
- Controller: `AuthController.login(data: LoginRequestDto)`
- Service: `AuthService.login(data: LoginRequestDto)`
- Entities: `User`
- DTOs: `LoginRequestDto`, `LoginResponseDto`
- Utilities: `JwtService`, `ConfigService`, `bcrypt`

Scope rules:
- Only login flow classes/methods; exclude register/reset/refresh.
- Use repository calls with relations when loading user roles.
- Show ownership/auth checks inline; no note blocks.
