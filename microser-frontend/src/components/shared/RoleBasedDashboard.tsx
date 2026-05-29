import { BarChart3, BookOpen, BriefcaseBusiness, GraduationCap, PackageCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { roleAccent, roleLabel } from '../../utils/formatters';

const roleConfig = {
  estudiante: {
    title: 'Campus Prime para estudiantes',
    subtitle: 'Ofertas, recomendaciones y productos populares entre estudiantes.',
    icons: [GraduationCap, Sparkles, TrendingUp],
    metrics: ['Wishlist activa', 'Ofertas semanales', 'Pedidos recientes'],
  },
  docente: {
    title: 'Centro de compras academicas',
    subtitle: 'Libros, herramientas tecnologicas y compras frecuentes para docencia.',
    icons: [BookOpen, BriefcaseBusiness, PackageCheck],
    metrics: ['Bibliografia', 'Herramientas', 'Compras recurrentes'],
  },
  administrativo: {
    title: 'Panel operativo institucional',
    subtitle: 'Gestion, metricas, inventario y seguimiento de pedidos.',
    icons: [BarChart3, PackageCheck, TrendingUp],
    metrics: ['Ordenes', 'Inventario', 'Conversion'],
  },
};

export function RoleBasedDashboard() {
  const session = useAuthStore((state) => state.session);
  const role = session?.rol || 'estudiante';
  const config = roleConfig[role];

  return (
    <section className={`overflow-hidden rounded-3xl bg-gradient-to-br ${roleAccent(role)} p-6 text-white shadow-soft`}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="badge bg-white/15 text-white">{roleLabel(role)}</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight lg:text-5xl">{config.title}</h1>
          <p className="mt-4 max-w-2xl text-white/78">{config.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {config.metrics.map((metric) => (
              <span key={metric} className="rounded-2xl bg-white/[0.14] px-4 py-3 text-sm font-black backdrop-blur">
                {metric}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 self-end">
          {config.icons.map((Icon, index) => (
            <div key={index} className="grid aspect-square place-items-center rounded-3xl bg-white/[0.12] backdrop-blur">
              <Icon size={38} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}