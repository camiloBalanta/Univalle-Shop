Quick run commands

Bring up gateway + frontend (rebuild):

```powershell
docker compose up -d --build gateway-service frontend-service
```

Note: ensure Docker Desktop is running and ports 3005 and 5173 are free.

Follow logs:

```powershell
docker compose logs -f gateway-service frontend-service
```

Stop and remove:

```powershell
docker compose down
```

Example: build and start gateway + frontend

```powershell
docker compose up -d --build gateway-service frontend-service
```
