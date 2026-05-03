$json = Get-Content test_register.json
$headers = @{
    "Content-Type" = "application/json"
}
Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" -Method POST -Headers $headers -Body $json
