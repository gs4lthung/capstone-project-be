# Convert CLASS_SPEC.md files to CSV-compatible format

$files = Get-ChildItem -Path ".\details" -Recurse -Filter "CLASS_SPEC.md"

foreach ($file in $files) {
    Write-Host "Processing: $($file.FullName)"
    
    $content = Get-Content $file.FullName -Raw
    $output = ""
    $currentClass = ""
    
    # Split into sections by ## Class:
    $sections = $content -split '(?=## Class: )'
    
    foreach ($section in $sections) {
        if ($section -match '^## Class: (.+?)[\r\n]') {
            $currentClass = $Matches[1].Trim()
            $output += "## Class: $currentClass`n`n"
            $output += '```csv' + "`n"
            $output += "Class,No,Method,Description`n"
            
            # Extract table rows
            $lines = $section -split "`n"
            foreach ($line in $lines) {
                if ($line -match '^\| (\d+) \| `([^`]+)` \| (.+) \|$') {
                    $no = $Matches[1]
                    $method = $Matches[2] -replace '"', '""'
                    $desc = $Matches[3].Trim() -replace '"', '""'
                    $output += """$currentClass"",$no,""$method"",""$desc""`n"
                }
                elseif ($line -match '^\| -  \| None   \| (.+) \|$') {
                    $desc = $Matches[1].Trim() -replace '"', '""'
                    $output += """$currentClass"",-,None,""$desc""`n"
                }
            }
            
            $output += '```' + "`n`n"
        }
        elseif ($section.Trim() -ne "") {
            # Keep non-class content (header, notes, etc.)
            $output += $section
        }
    }
    
    Set-Content $file.FullName -Value $output.TrimEnd() -NoNewline
}

Write-Host "Processed $($files.Count) files"
