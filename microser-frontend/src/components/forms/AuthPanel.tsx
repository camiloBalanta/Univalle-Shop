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
      notify({ type: 'success', title: 'Bienvenido, sesion iniciada', message: data.message });
      navigate('/dashboard');
    } catch (error) {
      notify({ type: 'error', title: 'Credenciales invalidas', message: apiErrorMessage(error) });
    }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="surface overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-gradient-to-br from-slate-950 via-brand-700 to-campus-600 p-8 text-white">
          <span className="badge bg-white/15 text-white">Portal institucional</span>
          <h1 className="mt-8 text-4xl font-black leading-tight">Bienvenido a tu espacio Univalle Shop.</h1>
          <p className="mt-4 text-white/78">
            Accede de forma sencilla para consultar tu informacion, gestionar tus compras y continuar tus actividades
            desde un entorno claro y confiable.
          </p>
          <div className="mt-10 grid gap-3">
            {[
              ['1', 'Ingreso rapido con tu codigo institucional'],
              ['2', 'Seguimiento de pedidos y productos favoritos'],
              ['3', 'Experiencia adaptada a tu perfil universitario'],
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
                <p className="text-sm font-black">Tu cuenta, siempre protegida</p>
                <p className="mt-1 text-xs font-bold text-white/70">
                  Usa tus datos institucionales para entrar de manera segura.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-8 sm:px-8 lg:px-10">
          <form className="grid w-full max-w-md gap-4" onSubmit={loginForm.handleSubmit(login)}>
            <div className="mb-1">
              <span className="text-xs font-black uppercase text-campus-600 dark:text-campus-300">
                Acceso seguro
              </span>
              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Iniciar sesion</h2>
              <p className="mt-2 text-sm font-semibold text-muted">
                Ingresa con tus datos institucionales para continuar.
              </p>
            </div>

            <div className="grid gap-3">
              <Field label="Codigo institucional" error={loginForm.formState.errors.codigo?.message}>
                <input
                  className="input h-11"
                  placeholder="Ingresa tu codigo"
                  autoComplete="username"
                  {...loginForm.register('codigo')}
                />
              </Field>
              <Field label="Contrasena" error={loginForm.formState.errors.password?.message}>
                <input
                  className="input h-11"
                  type="password"
                  placeholder="Ingresa tu contrasena"
                  autoComplete="current-password"
                  {...loginForm.register('password')}
                />
              </Field>
            </div>

            <div className="mt-1 grid gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                Perfil detectado: <span className="text-brand-700 dark:text-campus-300">{inferredRole}</span>
              </div>
              <button className="btn-primary h-11 justify-center" disabled={loginForm.formState.isSubmitting}>
                <LogIn size={18} /> Iniciar sesion
              </button>
            </div>
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