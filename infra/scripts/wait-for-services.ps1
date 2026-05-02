$mongoReady = $false
$redisReady = $false

while (-not ($mongoReady -and $redisReady)) {
  try {
    $mongoSocket = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    $mongoReady = [bool]$mongoSocket.TcpTestSucceeded
  } catch {
    $mongoReady = $false
  }

  try {
    $redisSocket = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue
    $redisReady = [bool]$redisSocket.TcpTestSucceeded
  } catch {
    $redisReady = $false
  }

  if (-not ($mongoReady -and $redisReady)) {
    Start-Sleep -Seconds 2
  }
}

Write-Host "MongoDB and Redis are reachable."
