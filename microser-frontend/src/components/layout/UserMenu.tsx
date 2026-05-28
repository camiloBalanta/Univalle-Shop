import { LogOut, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { roleLabel } from '../../utils/formatters';

export function UserMenu() {
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);

  if (!session) {
    return (
      <Link to="/auth" className="hidden rounded-xl bg-brand-600 px-4 py-3 text-sm font-black text-white transition hover:bg-brand-700 lg:inline-flex">
        Ingresar
      </Link>
    );
  }

  return (
    <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 lg:flex dark:border-slate-700 dark:bg-slate-900">
      <Link to="/profile" className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-campus-500 text-sm font-black text-white">
          <UserRound size={18} />
        </span>
        <span className="leading-tight">
          <strong className="block text-sm font-black text-slate-950 dark:text-white">{roleLabel(session.rol)}</strong>
          <span className="text-xs font-bold text-muted">{session.codigo}</span>
        </span>
      </Link>
      <button onClick={logout} className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800">
        <LogOut size={17} />
      </button>
    </div>
  );
}
