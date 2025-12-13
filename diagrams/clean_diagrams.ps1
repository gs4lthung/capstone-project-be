# Script to remove all attributes and methods from class diagrams

$files = @(
    "details\register-coach\class.puml",
    "details\approve-course\class.puml",
    "details\manage-course\class-diagram.puml",
    "details\manage-lesson\class.puml",
    "details\manage-lesson-quiz\class-diagram.puml",
    "details\manage-lesson-video\class-diagram.puml",
    "details\manage-session-quiz\class-diagram.puml",
    "details\manage-subject\class.puml",
    "details\take-attendance\class-diagram.puml",
    "details\update-achievement\class.puml",
    "details\update-coach-profile\class.puml",
    "details\verify-coach\class.puml",
    "details\update-configuration\class.puml",
    "details\update-session-calendar\class-diagram.puml",
    "details\view-session-calendar\class-diagram.puml"
)

foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file
    if (Test-Path $filePath) {
        Write-Host "Processing: $file"
        $content = Get-Content $filePath -Raw
        
        # Remove attributes and methods from classes, keeping only class name and separators
        # Pattern: class ClassName { ... content ... }
        $content = $content -replace '(?s)(class\s+\w+\s*\{)[^}]+(})', '$1`n  --`n$2'
        
        # For enums, keep them as is (don't modify enums)
        
        Set-Content $filePath $content -NoNewline
        Write-Host "Cleaned: $file"
    } else {
        Write-Host "Not found: $file"
    }
}

Write-Host "Done!"
