import { useRecommendations } from '../hooks/useRecommendations';
import { useAuthStore } from '../store/auth.store';
import { roleLabel } from '../utils/formatters';

export function RecommendationsPage() {
  const session = useAuthStore((state) => state.session);
  const { data, isLoading } = useRecommendations();
  const recommendations = data?.recommendations ?? [];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Recomendaciones personalizadas</h1>
        <p className="mt-1 text-muted">Curadas para {roleLabel(session?.rol)}.</p>
      </div>

      <section className="surface p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Para ti</h2>
            <p className="mt-1 text-sm text-muted dark:text-slate-400">
              {data?.averageScore
                ? `Puntaje promedio ${data.averageScore}`
                : 'Basado en tus compras y tendencias actuales.'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted">Cargando recomendaciones...</p>
        ) : recommendations.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((recommendation) => (
              <li key={recommendation.product} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-black text-campus-600">Recomendado</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {recommendation.score.toFixed(2)}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-black text-slate-950 dark:text-white">{recommendation.product}</h3>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No hay recomendaciones disponibles en este momento.</p>
        )}
      </section>
    </div>
  );
}
