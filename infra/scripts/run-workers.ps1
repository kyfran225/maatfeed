Push-Location (Resolve-Path "$PSScriptRoot\..\..\apps\api")

try {
  npm run worker
} finally {
  Pop-Location
}
