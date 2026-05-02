#Requires -Version 5.1
<#
.SYNOPSIS
    Cleans up all community data from MAAT FEED database.

.DESCRIPTION
    This script deletes all community-related data including:
    - Community Posts
    - Debate Threads
    - Comments
    - Replies
    - Comment Likes
    - Comment Reports
    - Related Redis cache keys

    This prepares the database for testing with ZERO community data.

.EXAMPLE
    .\cleanup-community-data.ps1

.NOTES
    Requires MongoDB and Redis to be running.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  MAAT FEED - Community Data Cleanup Tool" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)

Write-Host "Project root: $projectRoot" -ForegroundColor Gray
Set-Location $projectRoot

# Check if node_modules exists
if (-not (Test-Path "$projectRoot\node_modules")) {
    Write-Host "Error: node_modules not found. Please run 'npm install' first." -ForegroundColor Red
    exit 1
}

# Load environment variables from .env file if it exists
$envFile = "$projectRoot\.env"
if (Test-Path $envFile) {
    Write-Host "Loading environment from .env file..." -ForegroundColor Gray
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]*)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Remove quotes if present
            if ($value -match '^["'']') {
                $value = $value -replace '^["'']|["'']$'
            }
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

Write-Host ""
Write-Host "Starting community data cleanup..." -ForegroundColor Yellow
Write-Host "This will DELETE all debates, comments, replies, and community posts." -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Are you sure you want to continue? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "Cleanup cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Running cleanup script..." -ForegroundColor Cyan

# Run the TypeScript cleanup script using tsx
$npxPath = "$projectRoot\node_modules\.bin\npx.cmd"
if (Test-Path $npxPath) {
    & $npxPath tsx infra/scripts/cleanup-community-data.ts
} else {
    # Fallback to npx if local bin not found
    npx tsx infra/scripts/cleanup-community-data.ts
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host "  Community data cleanup completed!" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Database is now ready for testing with:" -ForegroundColor Cyan
    Write-Host "  - 0 Community Posts" -ForegroundColor Gray
    Write-Host "  - 0 Debate Threads" -ForegroundColor Gray
    Write-Host "  - 0 Comments" -ForegroundColor Gray
    Write-Host "  - 0 Replies" -ForegroundColor Gray
    Write-Host "  - 0 Comment Likes" -ForegroundColor Gray
    Write-Host "  - 0 Comment Reports" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Red
    Write-Host "  Cleanup failed with exit code $LASTEXITCODE" -ForegroundColor Red
    Write-Host "==============================================" -ForegroundColor Red
    exit $LASTEXITCODE
}
