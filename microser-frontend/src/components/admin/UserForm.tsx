import { useMemo, useState, type FormEvent } from 'react';
import { Usuario } from '../../types/domain';

export type UserFormValues = {
  fullName: string;
  codigo: string;
  anioRegistro: number;
  email: string;
  isActive: boolean;
};

interface UserFormProps {
  user?: Usuario;
  saving?: boolean;
  onSubmit: (values: UserFormValues) => void;
  onCancel: () => void;
}

function deriveRoleFromCodigo(codigo: string) {
  if (codigo.startsWith('1')) return 'estudiante';
  if (codigo.startsWith('2')) return 'docente';
  if (codigo.startsWith('3')) return 'administrativo';
  return null;
}

export function UserForm({ user, saving = false, onSubmit, onCancel }: UserFormProps) {
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [codigo, setCodigo] = useState(user?.codigo ?? '');
  const [anioRegistro, setAnioRegistro] = useState<number>(user?.anioRegistro ?? new Date().getFullYear());
  const [email, setEmail] = useState(user?.email ?? '');
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [touched, setTouched] = useState(false);

  const derivedRole = useMemo(() => deriveRoleFromCodigo(codigo), [codigo]);
  const isValidEmail = email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasErrors = !fullName.trim() || !codigo.trim() || !derivedRole || !Number.isInteger(anioRegistro) || anioRegistro < 2000 || anioRegistro > new Date().getFullYear() || !isValidEmail;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (hasErrors) return;

    onSubmit({
      fullName: fullName.trim(),
      codigo: codigo.trim(),
      anioRegistro,
      email: email.trim(),
      isActive,
    });
  };

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="input-group">
          <span>Nombre completo</span>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Ej. Ana Pérez"
            className="input"
          />
        </label>
        <label className="input-group">
          <span>Código institucional</span>
          <input
            value={codigo}
            onChange={(event) => setCodigo(event.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Ej. 3123456"
            className="input"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="input-group">
          <span>Año de ingreso</span>
          <input
            type="number"
            min={2000}
            max={new Date().getFullYear()}
            value={anioRegistro}
            onChange={(event) => setAnioRegistro(Number(event.target.value))}
            className="input"
          />
        </label>
        <label className="input-group">
          <span>Correo institucional</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="ejemplo@univalle.edu.co"
            className="input"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/90">
          <p className="text-sm text-slate-500 dark:text-slate-400">Rol detectado</p>
          <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">{derivedRole ?? 'Código inválido'}</p>
        </div>
        <label className="input-group items-center justify-between gap-4">
          <span>Estado</span>
          <button
            type="button"
            className={`rounded-full px-4 py-3 text-sm font-semibold ${isActive ? 'bg-emerald-500 text-white' : 'border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'}`}
            onClick={() => setIsActive((current) => !current)}
          >
            {isActive ? 'Activo' : 'Inactivo'}
          </button>
        </label>
      </div>

      {touched && hasErrors ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-600/30 dark:bg-rose-950/20 dark:text-rose-200">
          Revisa los campos obligatorios y el correo electrónico.
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : user ? 'Guardar cambios' : 'Crear usuario'}
        </button>
      </div>
    </form>
  );
}
