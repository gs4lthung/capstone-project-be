# Feature: Register Coach

- Controller: `CoachController.register(data: RegisterCoachDto, files: File[])`, `AuthController.verifyEmail(token: string)`
- Service: `CoachService.registerCoach(data: RegisterCoachDto, files: File[])`, `AuthService.verifyEmail(token: string)`
- Entities: `User`, `Coach`, `Credential`, `BaseCredential`, `Role`
- DTOs: `RegisterCoachDto`, `CreateCoachDto`
- Utilities: `JwtService`, `MailService`, `TwilioService`, `BunnyService`, `NotificationService`, `ConfigService`, `DataSource`

Scope rules:
- Registration flow with email/phone verification
- User can provide email or phoneNumber (at least one required)
- Include credential upload with file handling
- Include repository operations and transaction for atomic user creation
- Show Coach profile and Wallet initialization
- Send notification to admins after registration
- No note blocks; use inline method calls

## Class: CoachController

```csv
Class,No,Method,Description
"CoachController",01,"register(data: RegisterCoachDto, files: File[]): Promise<CustomApiResponse<void>>","Validates input; handles file uploads; delegates to CoachService.registerCoach"
```

## Class: CoachService

```csv
Class,No,Method,Description
"CoachService",01,"registerCoach(data: RegisterCoachDto, files: File[]): Promise<CustomApiResponse<void>>","Creates user account with coach role; uploads credentials; sends verification email/SMS; notifies admins"
"CoachService",02,"sendVerificationEmail(email: string, token: string): Promise<void>","Sends email verification link"
```

## Class: AuthController

```csv
Class,No,Method,Description
"AuthController",01,"verifyEmail(token: string): Promise<Response>","Verifies email using JWT token; redirects to success page"
```

## Class: AuthService

```csv
Class,No,Method,Description
"AuthService",01,"verifyEmail(token: string): Promise<string>","Validates JWT token; updates user isEmailVerified flag; returns redirect URL"
```

## Class: JwtService

```csv
Class,No,Method,Description
"JwtService",01,"signAsync(payload, options): Promise<string>","Signs JWT token with payload and options"
"JwtService",02,"verifyAsync(token): Promise<Payload>","Verifies and decodes JWT token"
```

## Class: MailService

```csv
Class,No,Method,Description
"MailService",01,"sendMail(data): Promise<void>","Sends email using template"
```

## Class: TwilioService

```csv
Class,No,Method,Description
"TwilioService",01,"sendSMS(phoneNumber): Promise<void>","Sends SMS verification code"
"TwilioService",02,"verifyPhoneNumber(phone, code): Promise<boolean>","Verifies SMS code"
```

## Class: BunnyService

```csv
Class,No,Method,Description
"BunnyService",01,"uploadToStorage(options): Promise<string>","Uploads file to Bunny CDN; returns public URL"
"BunnyService",02,"deleteFile(path): Promise<void>","Deletes file from storage"
```

## Class: NotificationService

```csv
Class,No,Method,Description
"NotificationService",01,"sendNotification(data): Promise<void>","Sends notification to specific user"
"NotificationService",02,"sendNotificationToAdmins(data): Promise<void>","Sends notification to all admin users"
```

## Class: ConfigService

```csv
Class,No,Method,Description
"ConfigService",01,"get(key: string): any","Retrieves configuration value"
```

## Class: User

```csv
Class,No,Method,Description
"User",-,"None","Entity representing platform user with authentication and verification fields"
```

## Class: Coach

```csv
Class,No,Method,Description
"Coach",-,"None","Entity representing coach profile with bio specialties teaching methods experience and verification status"
```

## Class: Credential

```csv
Class,No,Method,Description
"Credential",-,"None","Entity representing coach credentials with base credential reference and dates"
```

## Class: BaseCredential

```csv
Class,No,Method,Description
"BaseCredential",-,"None","Entity representing predefined credential types"
```

## Class: Role

```csv
Class,No,Method,Description
"Role",-,"None","Entity representing user role (ADMIN COACH LEARNER)"
```

## Class: RegisterCoachDto

```csv
Class,No,Method,Description
"RegisterCoachDto",-,"None","DTO carrying fullName email? phoneNumber? password province district and coach: CreateCoachDto"
```

## Class: CreateCoachDto

```csv
Class,No,Method,Description
"CreateCoachDto",-,"None","DTO carrying bio specialties teachingMethods yearOfExperience and credentials array"
```
