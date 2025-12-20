# Class Specifications - Login

## Class: AuthController

```csv
Class,No,Method,Description
"AuthController",01,"login(data: LoginRequestDto): Promise<CustomApiResponse<LoginResponseDto>>","Validates input; delegates to AuthService.login"
"AuthController",02,"refreshToken(refreshToken: string): Promise<CustomApiResponse<{accessToken: string}>>","Returns new access token"
```

## Class: AuthService

```csv
Class,No,Method,Description
"AuthService",01,"login(data: LoginRequestDto): Promise<CustomApiResponse<LoginResponseDto>>","Verifies credentials; signs tokens; updates last login"
"AuthService",02,"refreshNewAccessToken(refreshToken: string): Promise<CustomApiResponse<{accessToken: string}>>","Verifies refresh token; issues new access token"
```

## Class: JwtService

```csv
Class,No,Method,Description
"JwtService",01,"signAsync(payload options): Promise<string>","Signs a JWT token"
"JwtService",02,"verifyAsync(token options): Promise<any>","Verifies and decodes JWT"
```

## Class: ConfigService

```csv
Class,No,Method,Description
"ConfigService",01,"get(key: string): any","Retrieves configuration value"
```

## Class: User

```csv
Class,No,Method,Description
"User",-,"None","Entity representing platform user"
```

## Class: LoginRequestDto

```csv
Class,No,Method,Description
"LoginRequestDto",-,"None","DTO carrying email? phoneNumber? password"
```

## Class: LoginResponseDto

```csv
Class,No,Method,Description
"LoginResponseDto",-,"None","DTO returning accessToken refreshToken user"
```