$body = @{
    contentId = "69dbf3ba00a1b5c5868723fc"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/interactions/like" -Method POST -ContentType "application/json" -Body $body
