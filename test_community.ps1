# Test community functionality
$registerBody = @{
    email = "testuser@example.com"
    password = "password123"
    username = "testuser"
} | ConvertTo-Json

# Register user
$registerResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" -Method POST -ContentType "application/json" -Body $registerBody
Write-Host "User registered successfully"
Write-Host "Register response: $($registerResponse | ConvertTo-Json -Depth 2)"

# Login user
$loginBody = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$token = $loginResponse.data.accessToken
Write-Host "User logged in successfully"

# Create a comment
$commentBody = @{
    body = "This is fascinating content about Kemet civilization! The historical context is really important."
} | ConvertTo-Json

$commentResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/comments/69dbf3ba00a1b5c5868723fe" -Method POST -ContentType "application/json" -Body $commentBody -Headers @{Authorization = "Bearer $token"}
Write-Host "Comment created successfully"
Write-Host "Comment response: $($commentResponse | ConvertTo-Json -Depth 2)"

# Get comments for the content
$commentsResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/comments/69dbf3ba00a1b5c5868723fe" -Method GET
Write-Host "Comments retrieved:"
$commentsResponse.data | ConvertTo-Json -Depth 3
