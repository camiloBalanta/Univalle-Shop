import { UserRound } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { roleLabel } from '../utils/formatters';

export function ProfilePage() {
  const session = useAuthStore((state) => state.session);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="surface p-6 text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-campus-500 text-white">
          <UserRound size={38} />
        </div>
        <h1 className="mt-5 text-2xl font-black">{roleLabel(session?.rol)}</h1>
        <p className="text-muted">{session?.codigo}</p>
      </section>
      <section className="surface p-6">
        <h2 className="text-xl font-black">Informacion de cuenta</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ['ID', session?.userId],
            ['Codigo', session?.codigo],
            ['Anio registro', session?.anioRegistro],
            ['Rol', roleLabel(session?.rol)],
            ['Cambio de clave', session?.mustChangePassword ? 'Pendiente' : 'Completado'],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <dt className="text-xs font-black uppercase text-muted">{label}</dt>
              <dd className="mt-2 break-all font-black">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
