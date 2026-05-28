import { ProductCard } from '../components/product/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { useProducts } from '../hooks/useProducts';

export function CategoriesPage() {
  const { data: products = [], isLoading, isError } = useProducts();

  return (
    <div className="grid gap-6">
      <div>
        <span className="badge bg-campus-500/10 text-campus-600">Microservicio de catalogo</span>
        <h1 className="mt-3 text-3xl font-black">Catalogo de productos</h1>
        <p className="mt-1 text-muted">
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)}
        </div>
      ) : isError ? (
        <EmptyState
          title="No se pudo cargar catalogo"
          description="El frontend no usa productos fallback aqui. Revisa catalog-service o su conexion a Atlas."
        />
      ) : products.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <EmptyState
          title="Catalogo vacio"
          description="El microservicio respondio correctamente, pero no hay productos registrados en Atlas."
        />
      )}
    </div>
  );
}
