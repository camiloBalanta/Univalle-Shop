import { BarChart3, Boxes, Heart, Home, Package, ReceiptText, Search, Settings, Sparkles, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';

const commonLinks = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/catalog', label: 'Catalogo', icon: Boxes },
  { to: '/search', label: 'Buscador', icon: Search },
  { to: '/recommendations', label: 'Recomendaciones', icon: Sparkles },
  { to: '/orders', label: 'Ordenes', icon: ReceiptText },
];

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/admin/inventory', label: 'Inventario', icon: Package },
  { to: '/admin/settings', label: 'Gestion', icon: Settings },
];

export function Sidebar() {
  const session = useAuthStore((state) => state.session);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const links = session?.rol === 'administrativo' ? [...commonLinks, ...adminLinks] : commonLinks;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`fixed left-0 top-20 z-50 h-[calc(100vh-5rem)] w-80 rounded-br-3xl rounded-tr-3xl border-r border-slate-200 bg-white p-4 shadow-card transition-transform dark:border-white/10 dark:bg-slate-950/95 dark:shadow-[18px_0_50px_rgba(0,0,0,0.32)] dark:backdrop-blur-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center justify-between">
          <strong className="text-lg font-black text-slate-950 dark:text-white">Menu</strong>
          <button className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-white/[0.07] dark:text-slate-200 dark:hover:bg-white/10" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="mt-5 grid gap-1.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-extrabold transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/[0.14] dark:text-brand-100 dark:ring-1 dark:ring-brand-500/20'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white'
                }`
              }
            >
              <link.icon size={19} />
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/wishlist" className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white">
            <Heart size={19} />
            Wishlist
          </NavLink>
        </nav>
      </aside>
    </>
  );
}