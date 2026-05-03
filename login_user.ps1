$json = '{"email": "test@example.com", "password": "password123"}'
$headers = @{
    "Content-Type" = "application/json"
}
$response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -Headers $headers -Body $json
Write-Output $response
