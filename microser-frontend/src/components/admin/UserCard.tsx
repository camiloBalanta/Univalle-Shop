import { CheckCircle2, CircleDashed } from 'lucide-react';
import { Usuario } from '../../types/domain';

interface UserCardProps {
  user?: Usuario;
  title?: string;
  value?: string;
}

export function UserCard({ user, title, value }: UserCardProps) {
  if (user) {
    return (
      <article className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{user.rol}</p>
            <h3 className="mt-3 text-lg font-black text-slate-950 dark:text-white">{user.fullName || user.codigo}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{user.email || `${user.codigo}@univalle.edu.co`}</p>
          </div>
          <div className="rounded-3xl bg-white p-3 shadow-sm dark:bg-slate-900">
            {user.isActive ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <CircleDashed className="h-6 w-6 text-slate-400" />}
          </div>
        </div>
        <div className="mt-5 grid gap-2 text-sm text-slate-500 dark:text-slate-400">
          <p>Código: <strong>{user.codigo}</strong></p>
          <p>Estado: <strong>{user.isActive ? 'Activo' : 'Inactivo'}</strong></p>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{value}</h3>
    </article>
  );
}
