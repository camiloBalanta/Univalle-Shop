import { useQuery } from '@tanstack/react-query';
import { useRecommendations } from '../hooks/useRecommendations';
import { useAuthStore } from '../store/auth.store';
import { roleLabel } from '../utils/formatters';
import { Link } from 'react-router-dom';
import { recommendationsService } from '../services/recommendations.service';

export function RecommendationsPage() {
  const session = useAuthStore((state) => state.session);
  const { data, isLoading } = useRecommendations();
  const recommendations = data?.recommendations ?? [];

  const { data: ratings = [] } = useQuery({
    queryKey: ['product-ratings', session?.userId],
    queryFn: async () => {
      if (!session?.userId) {
        throw new Error('El usuario no está autenticado');
      }
      return recommendationsService.fetchRatings(session.userId);
    },
    enabled: Boolean(session?.token && session?.userId),
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Recomendaciones</h1>
        <p className="mt-1 text-muted">{roleLabel(session?.rol)}.</p>
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
          <div className="grid gap-8">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((recommendation) => {
                const rating = ratings.find((item) => item.productId === recommendation.productId);

                return (
                  <li key={recommendation.productId ?? recommendation.product} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-black text-campus-600">Recomendado</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {recommendation.score.toFixed(2)}
                      </span>
                    </div>
                    {recommendation.productId ? (
                      <Link
                        to={`/products/${recommendation.productId}`}
                        className="mt-3 block text-lg font-black text-slate-950 transition hover:text-brand-600 dark:text-white"
                      >
                        {recommendation.product}
                      </Link>
                    ) : (
                      <h3 className="mt-3 text-lg font-black text-slate-950 dark:text-white">{recommendation.product}</h3>
                    )}
                    {recommendation.category && (
                      <p className="mt-2 text-sm font-bold text-muted">{recommendation.category}</p>
                    )}
                    {rating?.review ? (
                      <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="font-black text-slate-900 dark:text-white">Tu reseña</p>
                        <p className="mt-2 text-slate-700 dark:text-slate-300">{rating.review}</p>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            {ratings.length > 0 ? (
              <section className="surface rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-2xl font-black">Tus reseñas recientes</h2>
                <p className="mt-1 text-sm text-muted dark:text-slate-400">
                  Aquí están los productos que ya calificaste y reseñaste.
                </p>
                <div className="mt-6 grid gap-4">
                  {ratings.map((rating) => (
                    <article key={`${rating.productId}-${rating.updatedAt}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{rating.productName}</p>
                          <p className="text-xs text-muted dark:text-slate-400">{rating.category}</p>
                        </div>
                        <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-black text-white">
                          {rating.rating}/5
                        </span>
                      </div>
                      {rating.review ? (
                        <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">{rating.review}</p>
                      ) : (
                        <p className="mt-4 text-sm text-muted">Sin reseña guardada.</p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted">No hay recomendaciones disponibles en este momento.</p>
        )}
      </section>
    </div>
  );
}
