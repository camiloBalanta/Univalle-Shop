import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { usersService, type CreateUserPayload, type UpdateUserPayload } from '../services/users.service';
import { useUiStore } from '../store/ui.store';
import { EmptyState } from '../components/ui/EmptyState';
import { UserCard } from '../components/admin/UserCard';
import { UserTable } from '../components/admin/UserTable';
import { UserModal } from '../components/admin/UserModal';
import { UserForm, type UserFormValues } from '../components/admin/UserForm';
import { Usuario, UserRole } from '../types/domain';

const roleLabels: Record<UserRole | 'all', string> = {
  all: 'Todos',
  estudiante: 'Estudiantes',
  docente: 'Profesores',
  administrativo: 'Administrativos',
};

export function AdminUsersPage() {
  const notify = useUiStore((state) => state.notify);
  const queryClient = useQueryClient();
  const { data: users = [], isLoading, isError } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === 'all' ? true : user.rol === roleFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery = query
        ? [user.fullName, user.codigo, user.email, user.rol]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(query))
        : true;
      return matchesRole && matchesQuery;
    });
  }, [users, roleFilter, searchQuery]);

  const recentUsers = filteredUsers.slice(0, 3);

  const openCreateUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditUser = (user: Usuario) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  async function handleSave(values: UserFormValues) {
    setIsSaving(true);

    try {
      if (selectedUser) {
        const payload: UpdateUserPayload = {
          fullName: values.fullName,
          codigo: values.codigo,
          anioRegistro: values.anioRegistro,
          email: values.email,
          isActive: values.isActive,
        };
        await usersService.updateUser(selectedUser.id, payload);
        notify({ type: 'success', title: 'Usuario actualizado', message: 'Los datos del usuario se guardaron correctamente.' });
      } else {
        const payload: CreateUserPayload = {
          fullName: values.fullName,
          codigo: values.codigo,
          anioRegistro: values.anioRegistro,
          email: values.email,
          isActive: values.isActive,
        };
        const response = await usersService.createUser(payload);
        notify({
          type: 'success',
          title: 'Usuario creado',
          message: `${response.message} Contraseña temporal: ${response.temporaryPassword}`,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    } catch (error) {
      notify({ type: 'error', title: 'Error guardando usuario', message: String(error) });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(user: Usuario) {
    if (!window.confirm(`¿Eliminar al usuario ${user.fullName || user.codigo}? Esta acción no se puede deshacer.`)) return;
    try {
      await usersService.deleteUser(user.id);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      notify({ type: 'success', title: 'Usuario eliminado', message: 'El usuario fue eliminado del sistema.' });
    } catch (error) {
      notify({ type: 'error', title: 'Error eliminando usuario', message: String(error) });
    }
  }

  async function handleToggleActive(user: Usuario) {
    try {
      await usersService.updateUser(user.id, { isActive: !user.isActive });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      notify({ type: 'success', title: 'Estado actualizado', message: `El usuario se marcó como ${user.isActive ? 'inactivo' : 'activo'}.` });
    } catch (error) {
      notify({ type: 'error', title: 'Error actualizando estado', message: String(error) });
    }
  }

  return (
    <div className="grid gap-8">
      <header className="grid gap-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-sm font-black uppercase tracking-[0.28em] text-brand-700 dark:bg-brand-500/[0.14] dark:text-brand-100">
              Gestión de usuarios
            </span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Usuarios institucionales</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Administra usuarios, crea cuentas nuevas, edita datos institucionales y controla el estado de acceso.
            </p>
          </div>
          <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={openCreateUser}>
            <Plus size={16} /> Crear Usuario
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <label className="input-group">
            <span>Buscar</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar por nombre, código, correo o rol"
              className="input"
            />
          </label>
          <div className="grid gap-2 sm:flex sm:items-center">
            {(['all', 'administrativo', 'docente', 'estudiante'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  roleFilter === role
                    ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:border-brand-400 dark:bg-brand-400/10 dark:text-brand-100'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                }`}
              >
                {roleLabels[role]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="grid gap-4">
          <div className="surface p-6">
            <h2 className="text-xl font-black">Resúmenes rápidos</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Estado general de los usuarios institucionales en el sistema.</p>
            <div className="mt-6 grid gap-4">
              <UserCard title="Total de usuarios" value={users.length.toString()} />
              <UserCard title="Usuarios activos" value={users.filter((user) => user.isActive).length.toString()} />
              <UserCard title="Usuarios inactivos" value={users.filter((user) => !user.isActive).length.toString()} />
            </div>
          </div>

          <div className="surface p-6">
            <h2 className="text-xl font-black">Usuarios recientes</h2>
            <p className="mt-1 text-sm text-muted">Los últimos usuarios filtrados en la lista.</p>
            <div className="mt-5 grid gap-3">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => <UserCard key={user.id} user={user} />)
              ) : (
                <p className="text-sm text-muted">No hay usuarios recientes que coincidan con los filtros.</p>
              )}
            </div>
          </div>
        </div>

        <div className="surface p-6">
          {isLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 rounded-3xl bg-slate-100 animate-pulse dark:bg-slate-900" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState title="No se pueden cargar los usuarios" description="Revisa la conexión con el microservicio de usuarios o vuelve a intentarlo." />
          ) : filteredUsers.length > 0 ? (
            <UserTable
              users={filteredUsers}
              onEdit={openEditUser}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ) : (
            <EmptyState title="No se encontraron usuarios" description="Ajusta los filtros o crea un usuario institucional nuevo." />
          )}
        </div>
      </section>

      <UserModal title={selectedUser ? 'Editar usuario' : 'Crear usuario'} isOpen={isModalOpen} onClose={closeModal}>
        <UserForm user={selectedUser ?? undefined} onCancel={closeModal} onSubmit={handleSave} saving={isSaving} />
      </UserModal>
    </div>
  );
}
