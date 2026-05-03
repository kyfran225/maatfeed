$json = Get-Content test_register.json
curl -X POST "http://localhost:4000/api/auth/register" -H "Content-Type: application/json" -d $json
