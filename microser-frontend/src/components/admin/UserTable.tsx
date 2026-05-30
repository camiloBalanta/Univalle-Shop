import { Edit3, Power, PowerOff, Trash2 } from 'lucide-react';
import { Usuario } from '../../types/domain';

interface UserTableProps {
  users: Usuario[];
  onEdit: (user: Usuario) => void;
  onDelete: (user: Usuario) => void;
  onToggleActive: (user: Usuario) => void;
}

function formatEmail(user: Usuario) {
  return user.email || `${user.codigo}@univalle.edu.co`;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function UserTable({ users, onEdit, onDelete, onToggleActive }: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <tr>
            <th className="px-6 py-4 font-semibold">Nombre</th>
            <th className="px-6 py-4 font-semibold">Código</th>
            <th className="px-6 py-4 font-semibold">Correo</th>
            <th className="px-6 py-4 font-semibold">Rol</th>
            <th className="px-6 py-4 font-semibold">Estado</th>
            <th className="px-6 py-4 font-semibold">Creado</th>
            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-slate-200 dark:border-slate-800">
              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{user.fullName || 'Sin nombre'}</td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.codigo}</td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{formatEmail(user)}</td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{capitalize(user.rol)}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'}`}>
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(user.createdAt).toLocaleDateString('es-CO')}</td>
              <td className="px-6 py-4 text-right">
                <div className="inline-flex items-center gap-2">
                  <button type="button" onClick={() => onEdit(user)} className="btn-ghost inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold">
                    <Edit3 size={14} /> Editar
                  </button>
                  <button type="button" onClick={() => onToggleActive(user)} className="btn-ghost inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold">
                    {user.isActive ? <PowerOff size={14} /> : <Power size={14} />} {user.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                  <button type="button" onClick={() => onDelete(user)} className="btn-ghost inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50">
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
