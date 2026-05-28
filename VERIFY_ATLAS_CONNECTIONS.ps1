# Script para verificar conexiones a MongoDB Atlas
# No requiere Docker, solo PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MongoDB Atlas Connection Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Leer variables de .env
$envFile = ".env"
$env_vars = @{}

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $env_vars[$matches[1]] = $matches[2]
        }
    }
} else {
    Write-Host "ERROR: No se encontró .env" -ForegroundColor Red
    exit 1
}

# Definir servicios a verificar
$services = @(
    @{
        Name = "Search (Búsqueda)"
        UriVar = "SEARCH_MONGO_URI"
        DbVar = "SEARCH_MONGO_DB_NAME"
        ExpectedDb = "Busquedad"
    },
    @{
        Name = "Catalog (Catálogo)"
        UriVar = "CATALOG_MONGO_URI"
        DbVar = "CATALOG_MONGO_DB_NAME"
        ExpectedDb = "catalogo"
    },
    @{
        Name = "Payment (Pagos)"
        UriVar = "PAYMENT_MONGO_URI"
        DbVar = "PAYMENT_MONGO_DB_NAME"
        ExpectedDb = "pagos"
    },
    @{
        Name = "Orders (Pedidos)"
        UriVar = "ORDERS_MONGO_URI"
        DbVar = "ORDERS_MONGO_DB_NAME"
        ExpectedDb = "pedidos"
    },
    @{
        Name = "Users (Usuarios)"
        UriVar = "USERS_MONGO_URI"
        DbVar = "USERS_MONGO_DB_NAME"
        ExpectedDb = "usuarios"
    },
    @{
        Name = "Recommendation (Recomendación)"
        UriVar = "RECOMMENDATION_MONGO_URI"
        DbVar = "RECOMMENDATION_MONGO_DB_NAME"
        ExpectedDb = "recommendation"
    }
)

# Verificar cada servicio
$passed = 0
$failed = 0

foreach ($service in $services) {
    Write-Host ""
    Write-Host "Verificando: $($service.Name)" -ForegroundColor Yellow
    Write-Host "-" * 50
    
    $uri = $env_vars[$service.UriVar]
    $db = $env_vars[$service.DbVar]
    
    if (-not $uri) {
        Write-Host "  ❌ ERROR: Variable $($service.UriVar) no encontrada en .env" -ForegroundColor Red
        $failed++
        continue
    }
    
    if (-not $db) {
        Write-Host "  ⚠️  Advertencia: Variable $($service.DbVar) no encontrada, usando: $($service.ExpectedDb)" -ForegroundColor Yellow
        $db = $service.ExpectedDb
    }
    
    # Extraer información del URI
    if ($uri -match "mongodb\+srv://([^:]+):([^@]+)@([^/]+)") {
        $username = $matches[1]
        $password = $matches[2]
        $mongoHost = $matches[3]
        
        Write-Host "  ✅ URI válido" -ForegroundColor Green
        Write-Host "     Host: $mongoHost"
        Write-Host "     Usuario: $username"
        Write-Host "     Database: $db"
        
        # Verificar que sea un URI de Atlas válido
        if ($mongoHost -match "mongodb\.net") {
            Write-Host "     Tipo: MongoDB Atlas ✅" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "     ⚠️  No parece ser un URI de MongoDB Atlas válido" -ForegroundColor Yellow
            $failed++
        }
    } else {
        Write-Host "  ❌ ERROR: URI no válido: $uri" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Configuraciones válidas: $passed" -ForegroundColor Green
Write-Host "❌ Errores encontrados: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✅ TODAS LAS CONEXIONES ESTÁN CORRECTAMENTE CONFIGURADAS" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Instala Docker Desktop: https://www.docker.com/products/docker-desktop"
    Write-Host "  2. Abre Docker Desktop"
    Write-Host "  3. Ejecuta: docker compose up -d --build"
    Write-Host "  4. Verifica: docker compose logs [service-name]"
} else {
    Write-Host "❌ REVISA LOS ERRORES ANTERIORES" -ForegroundColor Red
}

Write-Host ""
