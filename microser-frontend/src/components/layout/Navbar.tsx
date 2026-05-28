import { Menu, Moon, ShoppingBag, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useCartStore } from '../../store/cart.store';
import { useUiStore } from '../../store/ui.store';
import { roleLabel } from '../../utils/formatters';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';

export function Navbar() {
  const session = useAuthStore((state) => state.session);
  const cartItems = useCartStore((state) => state.items);
  const toggleCart = useUiStore((state) => state.toggleCart);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const theme = useUiStore((state) => state.theme);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/88">
      <div className="container-app">
        <div className="flex h-20 items-center gap-4">
          <button
            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 lg:hidden dark:border-slate-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={21} />
          </button>
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-lg font-black text-white shadow-card">
              US
            </span>
            <span className="hidden leading-tight sm:block">
              <strong className="block text-lg font-black text-slate-950 dark:text-white">Univalle Shop</strong>
              <span className="text-xs font-bold text-muted">{session ? roleLabel(session.rol) : 'Marketplace universitario'}</span>
            </span>
          </Link>
          <SearchBar />
          <button onClick={toggleTheme} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-200">
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button onClick={toggleCart} className="relative grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <ShoppingBag size={19} />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-brand-600 px-1 text-xs font-black text-white">
                {totalItems}
              </span>
            )}
          </button>
          <UserMenu />
        </div>
        <nav className="hidden h-11 items-center gap-6 overflow-x-auto text-sm font-extrabold text-slate-600 md:flex dark:text-slate-300">
          <Link to="/catalog" className="whitespace-nowrap transition hover:text-brand-600">
            Catalogo
          </Link>
          <Link to="/search" className="whitespace-nowrap transition hover:text-brand-600">
            Busqueda
          </Link>
          <Link to="/orders" className="whitespace-nowrap transition hover:text-brand-600">
            Ordenes
          </Link>
          <Link to="/recommendations" className="whitespace-nowrap transition hover:text-brand-600">
            Recomendaciones
          </Link>
        </nav>
      </div>
    </header>
  );
}
