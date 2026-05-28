Frontend deployment

Start the gateway and the single React frontend (served by nginx):

```powershell
docker compose up -d --build gateway-service frontend-service
```

Open the UI at http://localhost:5173. In Docker, the frontend uses `/api/` and nginx proxies it to the gateway at `gateway-service:3000`.

To stream logs during startup run:

```powershell
docker compose logs -f gateway-service frontend-service
```

After startup, open http://localhost:5173 and try the app features (carrito, crear orden). The frontend tries `VITE_API_URL`, `VITE_API_FALLBACK_URL`, `/api`, and finally `http://localhost:3005`.
If something fails, run the test script:

```powershell
.\TEST_RUN.ps1
```

If you prefer to run compose directly:

```powershell
docker compose up -d --build gateway-service frontend-service
```

After starting, if the UI cannot reach the API, check the gateway logs for errors and CORS.
