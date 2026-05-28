# Test Complete Payment Flow for UnivalleShop
# This script tests: Auth → Catalog → Carrito → Orders → Pagos

param(
  [string]$ApiUrl = "http://localhost:3005"
)

$ErrorActionPreference = "Stop"

function Write-Header {
  param([string]$Message)
  Write-Host "`n=== $Message ===" -ForegroundColor Cyan
}

function Write-Success {
  param([string]$Message)
  Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error_ {
  param([string]$Message)
  Write-Host "✗ $Message" -ForegroundColor Red
}

function Test-Api {
  param([string]$Url, [string]$Method = "GET", [object]$Body = $null)
  
  $params = @{
    Uri     = $Url
    Method  = $Method
    Headers = @{ "Content-Type" = "application/json" }
  }
  
  if ($Body) {
    $params["Body"] = $Body | ConvertTo-Json
  }
  
  try {
    $response = Invoke-RestMethod @params
    return $response
  }
  catch {
    Write-Error_ "Request failed: $($_.Exception.Message)"
    throw
  }
}

# ==================== START TESTS ====================

Write-Host "Starting Complete Payment Flow Test" -ForegroundColor Yellow
Write-Host "API URL: $ApiUrl" -ForegroundColor Gray

# 1. Solicitar Acceso
Write-Header "1. Request Access (Solicitar Acceso)"

$codigo = "3{0:D6}" -f (Get-Random -Maximum 999999)
$anioRegistro = (Get-Date).Year

$accessResponse = Test-Api `
  -Url "$ApiUrl/auth/solicitar-acceso" `
  -Method "POST" `
  -Body @{ codigo = $codigo; anioRegistro = $anioRegistro }

Write-Success "User created: $($accessResponse.userId)"
Write-Success "Temporary password: $($accessResponse.temporaryPassword)"
Write-Success "Role: $($accessResponse.rol)"

$userId = $accessResponse.userId
$tempPassword = $accessResponse.temporaryPassword

# 2. Login
Write-Header "2. Login"

$loginResponse = Test-Api `
  -Url "$ApiUrl/auth/login" `
  -Method "POST" `
  -Body @{ codigo = $codigo; anioRegistro = $anioRegistro; password = $tempPassword }

Write-Success "Session started with token: $($loginResponse.token.Substring(0, 20))..."
$token = $loginResponse.token

# 3. Create Demo Products
Write-Header "3. Create Demo Products"

$products = @(
  @{ name = "Cuaderno Univalle"; price = 12000; description = "Cuaderno universitario" },
  @{ name = "Termo Ingeniería"; price = 42000; description = "Termo reutilizable" },
  @{ name = "Hoodie Univalle"; price = 95000; description = "Buzo institucional" }
)

$productIds = @()
foreach ($product in $products) {
  $created = Test-Api -Url "$ApiUrl/catalog/products" -Method "POST" -Body $product
  $productIds += $created.id
  Write-Success "Created: $($product.name) (ID: $($created.id))"
}

# 4. List Products
Write-Header "4. List Products"

$catalog = Test-Api -Url "$ApiUrl/catalog/products"
Write-Success "Total products: $($catalog.Count)"

# 5. Create Cart and Add Items
Write-Header "5. Add Items to Cart"

$cartItems = @()
foreach ($i = 0; $i -lt 2; $i++) {
  $item = @{
    productId = $productIds[$i]
    quantity  = 1 + $i
    price     = $products[$i].price
  }
  
  $cart = Test-Api `
    -Url "$ApiUrl/cart/$userId/items" `
    -Method "POST" `
    -Body $item
  
  Write-Success "Added to cart: $($products[$i].name) (qty: $($item.quantity))"
  $cartItems += $item
}

# 6. Get Cart
Write-Header "6. Get Cart"

$cartResponse = Test-Api -Url "$ApiUrl/cart/$userId"
Write-Success "Cart items: $($cartResponse.items.Count)"
Write-Success "Total: COP $($cartResponse.totalAmount)"

# 7. Create Order (Checkout)
Write-Header "7. Create Order (Checkout)"

$orderData = @{
  customerId  = $userId
  items       = $cartItems
  totalAmount = $cartResponse.totalAmount
  clearCart   = $true
}

$orderResponse = Test-Api `
  -Url "$ApiUrl/orders" `
  -Method "POST" `
  -Body $orderData

$orderId = $orderResponse.id

Write-Success "Order created: $orderId"
Write-Success "Status: $($orderResponse.status)"
Write-Success "Total: COP $($orderResponse.totalAmount)"

# 8. Get User Orders
Write-Header "8. Get User Orders"

$userOrders = Test-Api -Url "$ApiUrl/orders/user/$userId"
Write-Success "User orders: $($userOrders.Count)"

# 9. NUEVO: Process Payment ⭐
Write-Header "9. Process Payment (NUEVO) ⭐"

$paymentData = @{
  amount     = $orderResponse.totalAmount
  customerId = $userId
}

$paymentResponse = Test-Api `
  -Url "$ApiUrl/payment/simulate/$orderId" `
  -Method "POST" `
  -Body $paymentData

Write-Success "Payment ID: $($paymentResponse.paymentId)"
Write-Success "Status: $($paymentResponse.status)"
Write-Success "Message: $($paymentResponse.message)"

# 10. Get Updated Order
Write-Header "10. Get Updated Order (After Payment)"

$updatedOrder = Test-Api -Url "$ApiUrl/orders/$orderId"
Write-Success "Order status: $($updatedOrder.status)"
Write-Host "  ID: $($updatedOrder.id)" -ForegroundColor Gray
Write-Host "  Total: COP $($updatedOrder.totalAmount)" -ForegroundColor Gray
Write-Host "  Created: $($updatedOrder.createdAt)" -ForegroundColor Gray

# 11. Final Summary
Write-Header "11. Summary"

$allOrders = Test-Api -Url "$ApiUrl/orders"
$paidOrders = $allOrders | Where-Object { $_.status -eq "paid" }

Write-Host "Total orders in system: $($allOrders.Count)" -ForegroundColor Gray
Write-Host "Paid orders: $($paidOrders.Count)" -ForegroundColor Gray
Write-Host "User orders: $($userOrders.Count)" -ForegroundColor Gray

Write-Host "`n" -ForegroundColor Green
Write-Host "✓ TEST COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "`nFlow: Auth → Catalog → Cart → Order → Payment ✓" -ForegroundColor Green
