# D'abord créer un profil pour l'utilisateur test
$profileJson = '{"displayName": "Test User", "avatar": "pharaon", "interests": ["kemet", "history"], "preferences": {"contentMix": "equilibr"}}'
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer dummy_token"  # On va créer le token après
}
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/profile" -Method POST -Headers $headers -Body $profileJson
    Write-Output $response
} catch {
    Write-Output "Erreur: $($_.Exception.Message)"
}
