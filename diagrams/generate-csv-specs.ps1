# Generate CSV-compatible CLASS_SPEC.md files

$specs = @{
    "login" = @{
        title = "Login"
        classes = @(
            @{name="AuthController"; methods=@(
                "01,login(data: LoginRequestDto): Promise<CustomApiResponse<LoginResponseDto>>,Validates input; delegates to AuthService.login; returns access & refresh tokens plus user data.",
                "02,refreshToken(refreshToken: string): Promise<CustomApiResponse<{accessToken: string}>>,Delegates to AuthService.refreshNewAccessToken; returns new access token."
            )},
            @{name="AuthService"; methods=@(
                "01,login(data: LoginRequestDto): Promise<CustomApiResponse<LoginResponseDto>>,Queries active verified user by email or phone; verifies password; signs access & refresh tokens; hashes and persists refresh token; updates last login; emits user.login event.",
                "02,refreshNewAccessToken(refreshToken: string): Promise<CustomApiResponse<{accessToken: string}>>,Verifies refresh token against stored hash; issues a new access token."
            )},
            @{name="JwtService"; methods=@(
                "01,signAsync(payload options): Promise<string>,Signs a JWT with provided payload and options.",
                "02,verifyAsync(token options): Promise<any>,Verifies and decodes a JWT token."
            )},
            @{name="ConfigService"; methods=@(
                "01,get(key: string): any,Retrieves configuration value (e.g. JWT secrets)."
            )},
            @{name="User"; methods=@(
                "-,None,Entity representing platform user with authentication fields."
            )},
            @{name="LoginRequestDto"; methods=@(
                "-,None,DTO carrying email? phoneNumber? and password."
            )},
            @{name="LoginResponseDto"; methods=@(
                "-,None,DTO returning accessToken refreshToken and user object."
            )}
        )
        notes = "Supports both email and phone number login"
    }
    "register" = @{
        title = "Register (Learner - Phone Number)"
        classes = @(
            @{name="AuthController"; methods=@(
                "01,register(data: RegisterRequestDto): Promise<CustomApiResponse<void>>,Delegates to AuthService.register; returns success with no body."
            )},
            @{name="AuthService"; methods=@(
                "01,register(data: RegisterRequestDto): Promise<CustomApiResponse<void>>,Validates phone uniqueness; hashes password; persists new user and learner; sends SMS verification; returns success.",
                "02,verifyPhone(data: VerifyPhoneDto): Promise<CustomApiResponse<void>>,Verifies SMS code via TwilioService; updates user isPhoneVerified and isActive to true."
            )},
            @{name="TwilioService"; methods=@(
                "01,sendSMS(to: string): Promise<any>,Triggers SMS verification via Twilio Verify service.",
                "02,verifyPhoneNumber(phoneNumber: string code: string): Promise<any>,Checks the verification code for the given phone number."
            )},
            @{name="ConfigService"; methods=@(
                "01,get(key: string): any,Provides config values for JWT and SMS providers."
            )},
            @{name="User"; methods=@(
                "-,None,Entity storing user data with phoneNumber verification flags."
            )},
            @{name="Learner"; methods=@(
                "-,None,Entity storing learner-specific data (skillLevel learningGoal)."
            )},
            @{name="RegisterRequestDto"; methods=@(
                "-,None,DTO carrying fullName phoneNumber password province district and learner: CreateLearnerDto."
            )},
            @{name="VerifyPhoneDto"; methods=@(
                "-,None,DTO carrying phoneNumber and code for SMS verification."
            )},
            @{name="CreateLearnerDto"; methods=@(
                "-,None,DTO carrying skillLevel and learningGoal (both PickleballLevel enum)."
            )}
        )
        notes = "Phone-only registration flow (no email verification)"
    }
    "register-coach" = @{
        title = "Register Coach (Phone Number)"
        classes = @(
            @{name="CoachController"; methods=@(
                "01,registerCoach(data: RegisterCoachDto files): Promise<CustomApiResponse<void>>,Validates input; uploads credential files; creates user/coach/credentials; sends SMS verification."
            )},
            @{name="CoachService"; methods=@(
                "01,registerCoach(data: RegisterCoachDto files): Promise<CustomApiResponse<void>>,Validates phone uniqueness; hashes password; uploads credential files to BunnyService; creates user coach and credentials in transaction; sends SMS verification; notifies admins."
            )},
            @{name="TwilioService"; methods=@(
                "01,sendSMS(to: string): Promise<any>,Triggers SMS verification via Twilio Verify service.",
                "02,verifyPhoneNumber(phoneNumber: string code: string): Promise<any>,Verifies the SMS code."
            )},
            @{name="BunnyService"; methods=@(
                "01,uploadFile(file): Promise<string>,Uploads credential files and returns URL."
            )},
            @{name="ConfigService"; methods=@(
                "-,None,Provides configuration values."
            )},
            @{name="NotificationService"; methods=@(
                "01,notifyAdmins(message): Promise<void>,Sends notification to admin users about new coach registration."
            )},
            @{name="DataSource"; methods=@(
                "-,None,TypeORM DataSource for managing transactions."
            )},
            @{name="User"; methods=@(
                "-,None,Entity storing user data."
            )},
            @{name="Coach"; methods=@(
                "-,None,Entity storing coach profile data."
            )},
            @{name="Credential"; methods=@(
                "-,None,Entity storing coach credentials (certificates licenses)."
            )},
            @{name="RegisterCoachDto"; methods=@(
                "-,None,DTO carrying fullName phoneNumber password province district bio specialties and credential data."
            )}
        )
        notes = "Phone-only coach registration with credential uploads"
    }
}

foreach ($key in $specs.Keys) {
    $spec = $specs[$key]
    $path = ".\details\$key\CLASS_SPEC.md"
    
    $content = "# Class Specifications — $($spec.title)`n`n"
    $content += "<!-- CSV-Compatible Format: Each class section contains a CSV block that can be easily exported. -->`n`n"
    
    foreach ($class in $spec.classes) {
        $content += "## Class: $($class.name)`n`n"
        $content += '```csv' + "`n"
        $content += "Class,No,Method,Description`n"
        
        foreach ($method in $class.methods) {
            $content += """$($class.name)"",$method`n"
        }
        
        $content += '```' + "`n`n"
    }
    
    $content += "## Notes`n"
    $content += "- $($spec.notes)`n"
    $content += "- Return types aligned with actual service implementations`n"
    $content += "- DTOs from libs/shared/src/dtos/`n"
    
    Set-Content $path -Value $content.TrimEnd() -NoNewline
    Write-Host "Created $path"
}

Write-Host "`nCreated $($specs.Count) CLASS_SPEC.md files with CSV format"
