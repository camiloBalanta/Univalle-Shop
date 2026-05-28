import { Outlet } from 'react-router-dom';
import { CartDrawer } from '../components/cart/CartDrawer';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { NotificationCenter } from '../components/shared/NotificationCenter';

export function MarketplaceLayout() {
  return (
    <div className="min-h-screen text-slate-950 dark:text-white">
      <Navbar />
      <div className="grid w-full gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[248px_minmax(0,1fr)] lg:px-8">
        <Sidebar />
        <main className="min-w-0 overflow-hidden">
          <Outlet />
        </main>
      </div>
      <CartDrawer />
      <NotificationCenter />
    </div>
  );
}
