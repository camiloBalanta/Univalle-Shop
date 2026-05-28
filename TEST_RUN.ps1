docker compose up -d --build gateway-service frontend-service
Start-Sleep -Seconds 5
docker compose ps gateway-service frontend-service
docker compose logs --tail 50 gateway-service frontend-service

$frontendPort = if ($env:FRONTEND_HOST_PORT) { $env:FRONTEND_HOST_PORT } else { "5173" }
$gatewayPort = if ($env:GATEWAY_SERVICE_HOST_PORT) { $env:GATEWAY_SERVICE_HOST_PORT } else { "3005" }

Write-Output "Frontend available: http://localhost:$frontendPort"
Write-Output "Gateway available: http://localhost:$gatewayPort"
exit 0
