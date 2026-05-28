import { FormEvent, useEffect, useMemo, useState } from 'react';

type CartItem = {
  productId: string;
  quantity: number;
  price: number;
};

type Cart = {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
};

type Order = {
  id: string;
  customerId: string;
  items: CartItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

type AccessResponse = {
  userId: string;
  codigo: string;
  anioRegistro: number;
  rol: string;
  mustChangePassword: boolean;
  message: string;
  temporaryPassword: string;
};

type LoginResponse = Omit<AccessResponse, 'temporaryPassword'> & {
  token: string;
};

type Notice = { type: 'ok' | 'error' | 'info'; text: string };

const API_CANDIDATES = [
  import.meta.env.VITE_API_URL,
  import.meta.env.VITE_API_FALLBACK_URL,
  '/api',
  'http://localhost:3005',
].filter(Boolean) as string[];

const DEMO_PRODUCTS = [
  {
    name: 'Cuaderno Univalle',
    price: 12000,
    description: 'Cuaderno universitario para apuntes de clase.',
  },
  {
    name: 'Termo Facultad de Ingeniería',
    price: 42000,
    description: 'Termo reutilizable para jornadas largas en campus.',
  },
  {
    name: 'Libro usado de cálculo',
    price: 35000,
    description: 'Material académico vendido por estudiantes.',
  },
  {
    name: 'Hoodie Universidad del Valle',
    price: 95000,
    description: 'Buzo institucional para comunidad Univalle.',
  },
];

function totalFromItems(items: CartItem[] = []) {
  return items.reduce((acc, it) => acc + it.quantity * it.price, 0);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

async function request<T>(apiUrl: string, path: string, init?: RequestInit): Promise<T> {
  const url = `${apiUrl || ''}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    let text = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      text = body.message || JSON.stringify(body) || text;
    } catch {
      text = await res.text();
    }
    throw new Error(text);
  }

  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

export default function App() {
  const [apiUrl, setApiUrl] = useState(API_CANDIDATES[0] ?? 'http://localhost:3005');
  const [apiOnline, setApiOnline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>({ type: 'info', text: 'Listo para la demo' });

  const [codigo, setCodigo] = useState(() => `3${String(Date.now()).slice(-6)}`);
  const [anioRegistro, setAnioRegistro] = useState(new Date().getFullYear());
  const [password, setPassword] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [session, setSession] = useState<LoginResponse | null>(null);

  const [customerId, setCustomerId] = useState(`demo-${Date.now()}`);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [query, setQuery] = useState('');

  const [cart, setCart] = useState<Cart | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const activeUserId = session?.userId || customerId;
  const cartTotal = useMemo(() => totalFromItems(cart?.items || []), [cart]);
  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      [product.name, product.description, product.id].some((value) =>
        String(value || '').toLowerCase().includes(term),
      ),
    );
  }, [products, query]);
  const userOrders = useMemo(
    () => orders.filter((order) => order.customerId === activeUserId),
    [orders, activeUserId],
  );

  async function detectApi() {
    for (const candidate of API_CANDIDATES) {
      try {
        const res = await fetch(`${candidate || ''}/`);
        if (res.ok) {
          setApiUrl(candidate);
          setApiOnline(true);
          setNotice({ type: 'ok', text: `Gateway activo: ${candidate || '/'}` });
          return;
        }
      } catch {
        // Try next candidate.
      }
    }
    setApiOnline(false);
    setNotice({ type: 'error', text: 'No se detectó backend' });
  }

  async function withBusy(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setNotice({ type: 'error', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function solicitarAcceso(e?: FormEvent) {
    e?.preventDefault();
    await withBusy(async () => {
      const data = await request<AccessResponse>(apiUrl, '/auth/solicitar-acceso', {
        method: 'POST',
        body: JSON.stringify({ codigo, anioRegistro }),
      });
      setTemporaryPassword(data.temporaryPassword);
      setPassword(data.temporaryPassword);
      setCustomerId(data.userId);
      setNotice({ type: 'ok', text: `${data.rol} Univalle creado. Copié la contraseña temporal al campo contraseña.` });
    });
  }

  async function login(e?: FormEvent) {
    e?.preventDefault();
    await withBusy(async () => {
      if (!password) throw new Error('Primero solicita acceso para generar la contraseña temporal');
      const data = await request<LoginResponse>(apiUrl, '/auth/login', {
        method: 'POST',
        body: JSON.stringify({ codigo, anioRegistro, password }),
      });
      setSession(data);
      setCustomerId(data.userId);
      setNotice({ type: 'ok', text: `Sesión iniciada como ${data.rol}` });
      await Promise.all([loadCart(data.userId), loadOrders()]);
    });
  }

  async function loadProducts() {
    try {
      const data = await request<Product[]>(apiUrl, '/catalog/products');
      setProducts(data);
      setNotice({ type: 'ok', text: `${data.length} productos disponibles` });
    } catch (error) {
      setProducts([]);
      if (error instanceof Error) {
        setNotice({ type: 'error', text: `No se pudo cargar catálogo: ${error.message}` });
      }
    }
  }

  async function createDemoProducts() {
    await withBusy(async () => {
      for (const product of DEMO_PRODUCTS) {
        await request<Product>(apiUrl, '/catalog/products', {
          method: 'POST',
          body: JSON.stringify(product),
        });
      }
      await loadProducts();
      setNotice({ type: 'ok', text: 'Productos demo creados' });
    });
  }

  async function loadCart(target = activeUserId) {
    try {
      const data = await request<Cart>(apiUrl, `/cart/${target}`);
      setCart(data);
      setNotice({ type: 'ok', text: `Carrito cargado (${data.items.length} items)` });
    } catch {
      setCart({ id: '', userId: target, items: [], totalAmount: 0 });
      setNotice({ type: 'info', text: `Carrito vacío o no existe: ${target}` });
    }
  }

  async function addItem(e?: FormEvent) {
    e?.preventDefault();
    await withBusy(async () => {
      if (!productId) throw new Error('Selecciona un producto');
      const data = await request<Cart>(apiUrl, `/cart/${activeUserId}/items`, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity, price }),
      });
      setCart(data);
      setNotice({ type: 'ok', text: 'Producto agregado al carrito' });
    });
  }

  async function updateCartItem(targetProductId: string, targetQuantity: number) {
    await withBusy(async () => {
      if (targetQuantity <= 0) throw new Error('La cantidad debe ser mayor a 0');
      const data = await request<Cart>(apiUrl, `/cart/${activeUserId}/items/${targetProductId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: targetQuantity }),
      });
      setCart(data);
      setNotice({ type: 'ok', text: 'Cantidad actualizada' });
    });
  }

  async function removeCartItem(targetProductId: string) {
    await withBusy(async () => {
      const data = await request<Cart>(apiUrl, `/cart/${activeUserId}/items/${targetProductId}`, {
        method: 'DELETE',
      });
      setCart(data);
      setNotice({ type: 'ok', text: 'Producto eliminado' });
    });
  }

  async function clearCart() {
    await withBusy(async () => {
      await request(apiUrl, `/cart/${activeUserId}`, { method: 'DELETE' });
      setCart({ id: '', userId: activeUserId, items: [], totalAmount: 0 });
      setNotice({ type: 'ok', text: 'Carrito limpiado' });
    });
  }

  async function checkout() {
    await withBusy(async () => {
      if (!session) throw new Error('Inicia sesión como usuario Univalle antes de comprar');
      if (!cart || cart.items.length === 0) throw new Error('Carrito vacío');
      const order = await request<Order>(apiUrl, '/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerId: activeUserId,
          items: cart.items,
          totalAmount: cartTotal,
          clearCart: true,
        }),
      });
      setNotice({ type: 'ok', text: `Orden creada: ${order.id}` });
      setCart({ id: '', userId: activeUserId, items: [], totalAmount: 0 });
      await loadOrders();
    });
  }

  async function processPayment(order: Order) {
    await withBusy(async () => {
      const response = await request<{ status: string; message: string }>(
        apiUrl,
        `/payment/simulate/${order.id}`,
        {
          method: 'POST',
          body: JSON.stringify({
            amount: order.totalAmount,
            customerId: order.customerId,
          }),
        },
      );
      const resultText =
        response.status === 'approved'
          ? `✓ Pago aprobado - ${response.message}`
          : `✗ Pago rechazado - ${response.message}`;
      setNotice({ type: response.status === 'approved' ? 'ok' : 'error', text: resultText });
      await loadOrders();
    });
  }

  async function loadOrders() {
    const data = await request<Order[]>(apiUrl, '/orders');
    setOrders(data);
    setNotice({ type: 'ok', text: `${data.length} órdenes cargadas` });
  }

  function selectProduct(product: Product) {
    setProductId(product.id);
    setPrice(product.price);
    setQuantity(1);
    setNotice({ type: 'info', text: `Producto seleccionado: ${product.name}` });
  }

  useEffect(() => {
    void detectApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!apiOnline) return;
    void Promise.all([loadOrders(), loadProducts()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiOnline, apiUrl]);

  useEffect(() => {
    if (!apiOnline) return;
    void loadCart(activeUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUserId, apiOnline, apiUrl]);

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <h1>Univalle Shop</h1>
          <p>
            {apiOnline ? `Gateway activo: ${apiUrl || '/'}` : 'Backend no detectado'}
            {session ? ` · ${session.rol} ${session.codigo}` : ''}
          </p>
        </div>
        <div className="topbar-actions">
          <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="API base URL" />
          <button disabled={busy} onClick={() => void detectApi()}>
            Detectar
          </button>
        </div>
      </header>

      <section className={`notice ${notice.type}`}>{notice.text}</section>

      <section className="layout">
        <article className="panel auth-panel">
          <div className="panel-head">
            <div>
              <h2>Acceso Univalle</h2>
              <p className="subtext">1 administrativo, 2 docente, 3 estudiante</p>
            </div>
            {session && <span className="badge">{session.rol}</span>}
          </div>

          <form className="form-grid" onSubmit={login}>
            <label>
              Código
              <input value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            </label>
            <label>
              Año registro
              <input
                type="number"
                value={anioRegistro}
                onChange={(e) => setAnioRegistro(Number(e.target.value))}
              />
            </label>
            <label>
              Contraseña
              <input value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button disabled={busy || !apiOnline} type="submit">
              Iniciar sesión
            </button>
          </form>
          <div className="actions">
            <button disabled={busy || !apiOnline} onClick={() => void solicitarAcceso()}>
              Solicitar acceso
            </button>
          </div>
          <div className={`temporary-box ${temporaryPassword ? 'ready' : ''}`}>
            <span>Contraseña temporal</span>
            <strong>{temporaryPassword || 'Haz clic en Solicitar acceso'}</strong>
          </div>
        </article>

        <article className="panel catalog-panel">
          <div className="panel-head">
            <div>
              <h2>Catálogo</h2>
              <p className="subtext">Productos disponibles para comunidad Univalle</p>
            </div>
            <div className="actions">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar producto" />
              <button disabled={busy} onClick={() => void loadProducts()}>
                Refrescar
              </button>
              <button disabled={busy} onClick={() => void createDemoProducts()}>
                Crear demo
              </button>
            </div>
          </div>
          <div className="catalog-grid">
            {filteredProducts.length === 0 ? (
              <div className="empty-state">No hay productos cargados</div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-header">
                    <strong>{product.name}</strong>
                    <span>{formatMoney(product.price)}</span>
                  </div>
                  <p>{product.description || 'Sin descripción disponible'}</p>
                  <button disabled={busy} onClick={() => selectProduct(product)}>
                    Seleccionar
                  </button>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <h2>Carrito</h2>
              <p className="subtext">Usuario: {activeUserId}</p>
            </div>
            <button disabled={busy} onClick={() => void loadCart()}>
              Recargar
            </button>
          </div>

          <form className="form-grid" onSubmit={addItem}>
            <label>
              Producto
              <input value={productId} onChange={(e) => setProductId(e.target.value)} />
            </label>
            <label>
              Cantidad
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </label>
            <label>
              Precio
              <input type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </label>
            <button disabled={busy || !session} type="submit">
              Agregar
            </button>
          </form>

          <div className="cart-table-wrapper">
            {cart && cart.items.length > 0 ? (
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.productId}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => void updateCartItem(item.productId, Number(e.target.value))}
                        />
                      </td>
                      <td>{formatMoney(item.price)}</td>
                      <td>{formatMoney(item.quantity * item.price)}</td>
                      <td>
                        <button className="text-button" disabled={busy} onClick={() => void removeCartItem(item.productId)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">El carrito está vacío.</div>
            )}
          </div>

          <div className="summary">
            <span>Total: {formatMoney(cartTotal)}</span>
            <div className="actions">
              <button disabled={busy || (cart?.items.length ?? 0) === 0} onClick={() => void checkout()}>
                Checkout
              </button>
              <button disabled={busy || (cart?.items.length ?? 0) === 0} onClick={() => void clearCart()}>
                Limpiar
              </button>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <h2>Órdenes</h2>
              <p className="subtext">Historial del usuario activo</p>
            </div>
            <button disabled={busy} onClick={() => void loadOrders()}>
              Cargar
            </button>
          </div>

          <div className="orders">
            {userOrders.length === 0 ? (
              <div className="empty-state">No hay órdenes aún.</div>
            ) : (
              userOrders.map((o) => (
                <div key={o.id} className="row order-row">
                  <div>
                    <strong>#{o.id}</strong>
                    <div>
                      <small>{new Date(o.createdAt).toLocaleString('es-CO')}</small>
                    </div>
                  </div>
                  <div>
                    <span className={`status status-${o.status}`}>{o.status}</span>
                    <span>{formatMoney(o.totalAmount)}</span>
                  </div>
                  <div>
                    {o.status !== 'paid' && o.status !== 'payment_rejected' && (
                      <button
                        disabled={busy || o.status === 'cancelled'}
                        className="pay-button"
                        onClick={() => void processPayment(o)}
                      >
                        Pagar
                      </button>
                    )}
                    {o.status === 'payment_rejected' && (
                      <button
                        disabled={busy}
                        className="pay-button"
                        onClick={() => void processPayment(o)}
                      >
                        Reintentar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
