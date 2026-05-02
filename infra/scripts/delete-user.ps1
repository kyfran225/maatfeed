#!/usr/bin/env pwsh
# Script to delete a user by email
# Usage: .\delete-user.ps1 [email]
# Default email: kyfran6@gmail.com

$email = if ($args[0]) { $args[0] } else { "kyfran6@gmail.com" }

Write-Host "🗑️  Deleting user with email: $email" -ForegroundColor Yellow
Write-Host ""

# Change to API directory and run the script
$apiDir = Join-Path $PSScriptRoot "..\..\apps\api"
Set-Location $apiDir

# Set email as environment variable for the script
$env:TARGET_EMAIL = $email

npm run delete:user

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ User deletion completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ User deletion failed!" -ForegroundColor Red
}
