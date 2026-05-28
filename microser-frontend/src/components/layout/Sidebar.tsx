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
        className={`fixed inset-0 z-40 bg-slate-950/50 transition lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`fixed left-0 top-0 z-50 h-screen w-80 border-r border-slate-200 bg-white p-4 transition-transform lg:sticky lg:top-[6.25rem] lg:z-20 lg:h-[calc(100vh-7.5rem)] lg:w-full lg:translate-x-0 lg:rounded-3xl lg:border lg:shadow-card dark:border-slate-800 dark:bg-slate-950 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <strong className="text-lg font-black">Menu</strong>
          <button className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800" onClick={() => setSidebarOpen(false)}>
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
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-100'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                }`
              }
            >
              <link.icon size={19} />
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/wishlist" className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">
            <Heart size={19} />
            Wishlist
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
