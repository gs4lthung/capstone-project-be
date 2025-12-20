# Feature: Learner Register (Phone Number)

- Presentation: `RegisterScreen` collects user info with phone number
- Controller: `AuthController.register(data: RegisterRequestDto)`, `AuthController.verifyPhone(data)`
- Service: `AuthService.register(data: RegisterRequestDto)`, `AuthService.verifyPhone(data: VerifyPhoneDto)`
- Entities: `User` (with Learner, Wallet relationships), `Learner`, `Wallet`, `Role`
- DTOs: `RegisterRequestDto`, `CreateLearnerDto`, `VerifyPhoneDto`
- Utilities: `TwilioService`, `ConfigService`, `DataSource`

Scope rules:
- Registration flow with phone verification only
- User must provide phoneNumber (required)
- Include phone verification via SMS code
- Include repository operations and transaction for atomic user creation
- Show Learner profile and Wallet initialization
- No note blocks; use inline method calls
