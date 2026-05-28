import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Database, LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { apiErrorMessage } from '../../services/api.client';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { LoginFormValues, loginSchema } from '../../features/auth/auth.schema';

export function AuthPanel() {
  const setSession = useAuthStore((state) => state.setSession);
  const notify = useUiStore((state) => state.notify);
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { codigo: '', password: '' },
  });
  const watchedLoginCode = loginForm.watch('codigo');
  const inferredRole = inferRole(watchedLoginCode);

  async function login(values: LoginFormValues) {
    try {
      const data = await authService.login(values);
      setSession(data);
      notify({ type: 'success', title: 'Sesion iniciada con usuario real', message: data.message });
      navigate('/dashboard');
    } catch (error) {
      notify({ type: 'error', title: 'Credenciales invalidas', message: apiErrorMessage(error) });
    }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="surface overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-gradient-to-br from-slate-950 via-brand-700 to-campus-600 p-8 text-white">
          <span className="badge bg-white/15 text-white">MongoDB Atlas + JWT</span>
          <h1 className="mt-8 text-4xl font-black leading-tight">Ingresa con usuarios reales de la base de datos.</h1>
          <p className="mt-4 text-white/78">
            El login consulta el microservicio de usuarios, valida la contrasena hasheada y devuelve un token real.
          </p>
          <div className="mt-10 grid gap-3">
            {[
              ['1', 'Usuario existente en la coleccion usuarios de Atlas'],
              ['2', 'Validacion por codigo y contrasena'],
              ['3', 'Dashboard distinto para estudiante, profesor o administrativo'],
            ].map(([step, text]) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sm font-black text-brand-700">
                  {step}
                </span>
                <span className="text-sm font-bold">{text}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-4">
            <div className="flex items-center gap-3">
              <Database size={22} />
              <div>
                <strong className="block text-sm">Fuente de identidad</strong>
                <span className="text-sm text-white/75">MongoDB Atlas via users-service</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
            No hay usuarios mock para autenticacion: este formulario llama a <strong>/auth/login</strong> y valida contra Atlas.
          </div>

          <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-black uppercase text-muted">Rol detectado por codigo</span>
            <strong className="text-lg text-slate-950 dark:text-white">{inferredRole}</strong>
            <p className="text-sm text-muted">1 administrativo, 2 profesor, 3 estudiante.</p>
          </div>

          <form className="grid gap-4" onSubmit={loginForm.handleSubmit(login)}>
            <Field label="Codigo institucional" error={loginForm.formState.errors.codigo?.message}>
              <input className="input" placeholder="Codigo existente en Atlas" autoComplete="username" {...loginForm.register('codigo')} />
            </Field>
            <Field label="Contrasena" error={loginForm.formState.errors.password?.message}>
              <input className="input" type="password" placeholder="Contrasena del usuario real" autoComplete="current-password" {...loginForm.register('password')} />
            </Field>
            <button className="btn-primary" disabled={loginForm.formState.isSubmitting}>
              Iniciar sesion
            </button>
          </form>
        </div>
      </div>
    </motion.section>
  );
}

function inferRole(codigo?: string) {
  if (!codigo) return 'Pendiente de codigo';
  if (codigo.startsWith('1')) return 'Administrativo';
  if (codigo.startsWith('2')) return 'Profesor';
  if (codigo.startsWith('3')) return 'Estudiante';
  return 'Codigo no institucional';
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
      {label}
      {children}
      {error && <span className="text-xs font-bold text-rose-500">{error}</span>}
    </label>
  );
}
