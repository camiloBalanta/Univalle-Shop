import { Package, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { ProductCarousel } from '../components/product/ProductCarousel';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { useProduct, useProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/cart.store';
import { useUiStore } from '../store/ui.store';
import { formatMoney } from '../utils/formatters';

export function ProductPage() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: products = [] } = useProducts();
  const addProduct = useCartStore((state) => state.addProduct);
  const notify = useUiStore((state) => state.notify);

  if (isLoading) return <ProductCardSkeleton />;
  if (!product) {
    return (
      <EmptyState
        title="Producto no encontrado"
        description="El microservicio de catalogo no devolvio un producto para este ID."
      />
    );
  }

  const imageUrl = product.images?.[0];

  return (
    <div className="grid gap-8">
      <section className="surface grid gap-8 p-5 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
        <div className="grid min-h-[320px] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 dark:from-slate-800 dark:to-slate-900">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="grid min-h-[320px] place-items-center">
              <Package size={86} />
            </div>
          )}
        </div>
        <div>
          <span className="badge bg-campus-500/10 text-campus-600">Producto de catalogo</span>
          <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">{product.name}</h1>
          <p className="mt-5 text-lg text-muted dark:text-slate-300">
            {product.description || 'Sin descripcion registrada en el microservicio de catalogo.'}
          </p>
          <p className="mt-6 text-4xl font-black text-brand-600">{formatMoney(product.price)}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="btn-primary"
              onClick={() => {
                addProduct(product);
                notify({ type: 'success', title: 'Producto agregado', message: product.name });
              }}
            >
              <ShoppingCart size={18} /> Agregar al carrito
            </button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Info icon={Truck} title="Entrega" text="Preparado para conectar con ordenes." />
            <Info icon={ShieldCheck} title="Contrato real" text="Campos: id, name, price, description e imágenes." />
          </div>
        </div>
      </section>
      <ProductCarousel title="Mas productos del catalogo" products={products.filter((item) => item.id !== product.id).slice(0, 5)} />
    </div>
  );
}

function Info({ icon: Icon, title, text }: { icon: typeof Truck; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <Icon className="text-campus-600" size={22} />
      <h3 className="mt-3 font-black">{title}</h3>
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}
