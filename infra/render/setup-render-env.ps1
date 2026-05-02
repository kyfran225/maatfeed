# Script PowerShell pour configurer les variables d'environnement sur Render
# Usage: .\setup-render-env.ps1 -ServiceId <service_id> -EnvFile <.env.production|.env.staging>

param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceId,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet(".env.production", ".env.staging")]
    [string]$EnvFile
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 Configuration des variables Render pour le service: $ServiceId" -ForegroundColor Cyan
Write-Host "📄 Fichier d'environnement: $EnvFile" -ForegroundColor Cyan
Write-Host ""

# Lire le fichier .env
$envContent = Get-Content -Path $EnvFile -Raw
$lines = $envContent -split "`n"

$envVars = @{}
foreach ($line in $lines) {
    $line = $line.Trim()
    
    # Ignorer les commentaires et lignes vides
    if ($line -match "^#" -or [string]::IsNullOrWhiteSpace($line)) {
        continue
    }
    
    # Parser KEY=VALUE
    if ($line -match "^([^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Supprimer les guillemets si présents
        if ($value -match '^"(.*)"$') {
            $value = $matches[1]
        }
        
        $envVars[$key] = $value
    }
}

Write-Host "✅ Variables trouvées: $($envVars.Count)" -ForegroundColor Green
Write-Host ""

# Variables sensibles à ne pas afficher
$sensitiveKeys = @(
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "SESSION_SECRET",
    "MONGODB_URI",
    "REDIS_URL",
    "UPSTASH_REST_TOKEN",
    "YOUTUBE_API_KEY",
    "APIFY_API_TOKEN",
    "HUGGINGFACE_API_KEY",
    "GROQ_API_KEY",
    "GEMINI_API_KEY",
    "OPENROUTER_API_KEY",
    "OPENAI_API_KEY",
    "RESEND_API_KEY",
    "CLOUDINARY_API_SECRET",
    "VAPID_PRIVATE_KEY"
)

# Afficher les variables (masquer les sensibles)
Write-Host "📋 Variables à configurer:" -ForegroundColor Yellow
foreach ($key in $envVars.Keys | Sort-Object) {
    if ($sensitiveKeys -contains $key) {
        Write-Host "  • $key = ***MASKED***" -ForegroundColor Gray
    } else {
        $displayValue = $envVars[$key]
        if ($displayValue.Length -gt 50) {
            $displayValue = $displayValue.Substring(0, 50) + "..."
        }
        Write-Host "  • $key = $displayValue" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "⚠️  IMPORTANT: Render CLI n'est pas disponible sur Windows." -ForegroundColor Red
Write-Host "   Vous devez configurer ces variables manuellement dans le dashboard:" -ForegroundColor Yellow
Write-Host "   https://dashboard.render.com/services/$ServiceId/environment" -ForegroundColor Cyan
Write-Host ""

# Générer un fichier de commandes curl
$curlFile = "render-env-curl-commands.txt"
$curlCommands = @()

foreach ($key in $envVars.Keys | Sort-Object) {
    $value = $envVars[$key] -replace '"', '\"'
    $curlCmd = "curl -X POST https://api.render.com/v1/services/$ServiceId/env-vars ``
  -H 'Accept: application/json' ``
  -H 'Authorization: Bearer YOUR_RENDER_API_KEY' ``
  -d '{`"key`":`"$key`",`"value`":`"$value`"}'"
    $curlCommands += $curlCmd
}

$curlCommands | Out-File -FilePath $curlFile -Encoding UTF8

Write-Host "💾 Commandes curl générées dans: $curlFile" -ForegroundColor Green
Write-Host "   (Remplacez YOUR_RENDER_API_KEY par votre clé API Render)" -ForegroundColor Gray
Write-Host ""

Write-Host "📖 Instructions:" -ForegroundColor Cyan
Write-Host "   1. Allez sur https://dashboard.render.com" -ForegroundColor White
Write-Host "   2. Sélectionnez votre service: $ServiceId" -ForegroundColor White
Write-Host "   3. Cliquez sur 'Environment' dans le menu" -ForegroundColor White
Write-Host "   4. Ajoutez chaque variable une par une" -ForegroundColor White
Write-Host ""
