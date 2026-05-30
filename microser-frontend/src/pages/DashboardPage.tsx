import { RoleBasedDashboard } from '../components/shared/RoleBasedDashboard';
import { useRecommendations } from '../hooks/useRecommendations';
import { useProducts } from '../hooks/useProducts';
import { useUsers } from '../hooks/useUsers';
import { useAuthStore } from '../store/auth.store';

export function DashboardPage() {
  const session = useAuthStore((state) => state.session);
  const isAdmin = session?.rol === 'administrativo';
  const { data: products = [] } = useProducts();
  const { data: users = [] } = useUsers();
  const { data: recommendationsData } = useRecommendations();
  const recommendations =
    recommendationsData?.topRecommendations?.length > 0
      ? recommendationsData.topRecommendations
      : recommendationsData?.recommendations ?? [];

  return (
    <div className="grid gap-6">
      <RoleBasedDashboard />
      <section className="grid gap-4 md:grid-cols-3">
        <article className="surface p-5">
          <span className="text-sm font-black text-muted">Rol</span>
          <strong className="mt-2 block text-3xl font-black">{session?.rol || 'Invitado'}</strong>
        </article>

        {isAdmin && (
          <>
            <article className="surface p-5">
              <span className="text-sm font-black text-muted">Usuarios</span>
              <strong className="mt-2 block text-3xl font-black">{users.length}</strong>
            </article>
            <article className="surface p-5">
              <span className="text-sm font-black text-muted">Productos activos</span>
              <strong className="mt-2 block text-3xl font-black">{products.length}</strong>
            </article>
          </>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {isAdmin && (
          <div className="surface p-6">
            <h2 className="text-xl font-black">Usuarios recientes</h2>
            <p className="mt-1 text-sm text-muted">Lista de usuarios.</p>
            <div className="mt-5 grid gap-3">
              {users.length > 0 ? (
                users.slice(0, 4).map((user) => (
                  <article
                    key={user.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-black text-slate-950 dark:text-white">{user.codigo}</h3>
                        <p className="text-sm text-muted">Rol: {user.rol}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {user.anioRegistro}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted">No hay usuarios disponibles todavía.</p>
              )}
            </div>
          </div>
        )}

        <div className="surface p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">Recomendaciones para ti</h2>
              <p className="mt-1 text-sm text-muted">
                {isAdmin
                  ? 'Resumen de las recomendaciones disponibles en el sistema.'
                  : 'Basado en tu historial y los productos más relevantes para ti.'}
              </p>
            </div>
          </div>
          <div className="grid gap-3">
            {recommendations.length > 0 ? (
              recommendations.slice(0, 4).map((recommendation) => (
                <article
                  key={recommendation.product}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black text-slate-950 dark:text-white">{recommendation.product}</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {recommendation.score.toFixed(2)}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-muted">No hay recomendaciones disponibles todavía.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
