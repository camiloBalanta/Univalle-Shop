import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCarousel } from '../components/product/ProductCarousel';
import { RoleBasedDashboard } from '../components/shared/RoleBasedDashboard';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { useProducts } from '../hooks/useProducts';
import { useAuthStore } from '../store/auth.store';

export function HomePage() {
  const { data: products = [], isLoading, isError } = useProducts();
  const session = useAuthStore((state) => state.session);

  return (
    <div className="grid gap-8">
      {session ? (
        <RoleBasedDashboard />
      ) : (
        <section className="overflow-hidden rounded-3xl bg-slate-950 shadow-soft">
          <div className="grid lg:grid-cols-[1fr_0.9fr]">
            <div className="p-8 text-white lg:p-12">
              <span className="badge bg-white/15 text-white">Marketplace universitario premium</span>
              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight lg:text-6xl">
                Compra tecnologia, libros y productos de campus en una experiencia real.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-white/72">
                Univalle Shop conecta usuarios, catalogo, ordenes, pagos, busqueda y recomendaciones en una plataforma moderna.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/auth" className="btn-primary bg-white text-slate-950 hover:bg-slate-100">
                  Empezar ahora <ArrowRight size={18} />
                </Link>
                <Link to="/catalog" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/15">
                  Ver catalogo
                </Link>
              </div>
            </div>
            <div className="relative min-h-[360px]">
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1100&q=80"
                alt="Personas comprando en plataforma digital"
                className="h-full w-full object-cover opacity-90"
              />
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Entrega campus', 'Recibe en puntos autorizados.', Truck],
          ['Pagos seguros', 'Transacciones protegidas.', ShieldCheck],
          ['Recomendaciones', 'Productos sugeridos basados en tu historial de compras.', Zap],
        ].map(([title, text, Icon]) => (
          <motion.article key={title as string} whileHover={{ y: -4 }} className="surface flex items-center gap-4 p-5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/40">
              <Icon size={22} />
            </div>
            <div>
              <h3 className="font-black">{title as string}</h3>
              <p className="text-sm text-muted">{text as string}</p>
            </div>
          </motion.article>
        ))}
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Catalogo no disponible"
          description="Error."
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="Catalogo vacio"
          description="No hay productos disponibles en el catalogo."
        />
      ) : (
        <ProductCarousel
          title="Productos del catalogo"
          products={products.slice(0, 5)}
        />
      )}
    </div>
  );
}
