import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Wrench } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useUsers } from '../hooks/useUsers';
import { useProducts } from '../hooks/useProducts';

export function AdminSettingsPage() {
  const session = useAuthStore((state) => state.session);
  const { data: users = [] } = useUsers();
  const { data: products = [] } = useProducts();

  return (
    <div className="grid gap-8">
      <header className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-sm font-black uppercase tracking-[0.28em] text-brand-700 dark:bg-brand-500/[0.14] dark:text-brand-100">
              Panel de gestión
            </span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Configuración institucional</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Ajusta la gestión del sistema, revisa métricas clave y accede rápidamente a los controles de usuario institucional.
            </p>
          </div>
          <Link to="/admin/users" className="btn-primary inline-flex items-center gap-2">
            <Users size={16} /> Administrar usuarios
          </Link>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="surface p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-brand-700" />
            <div>
              <h2 className="text-xl font-black">Acceso</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Usuario conectado</p>
            </div>
          </div>
          <div className="mt-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <p>
              <strong>{session?.codigo ?? 'Sin código'}</strong> · Rol <strong>{session?.rol ?? 'Desconocido'}</strong>
            </p>
            <p className="mt-3">Revisa el estado de permisos y actualiza la configuración del sistema.</p>
          </div>
        </article>

        <article className="surface p-6">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-brand-700" />
            <div>
              <h2 className="text-xl font-black">Usuarios</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Cuentas institucionales</p>
            </div>
          </div>
          <p className="mt-6 text-3xl font-black text-slate-950 dark:text-white">{users.length}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Total de usuarios registrados en el sistema.</p>
        </article>

        <article className="surface p-6">
          <div className="flex items-center gap-3">
            <Wrench size={24} className="text-brand-700" />
            <div>
              <h2 className="text-xl font-black">Inventario</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Productos</p>
            </div>
          </div>
          <p className="mt-6 text-3xl font-black text-slate-950 dark:text-white">{products.length}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Productos activos en el catálogo.</p>
        </article>
      </section>
    </div>
  );
}
