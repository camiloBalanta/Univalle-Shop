import { Product } from '../../types/domain';
import { ProductCard } from './ProductCard';

type ProductCarouselProps = {
  title: string;
  subtitle?: string;
  products: Product[];
};

export function ProductCarousel({ title, subtitle, products }: ProductCarouselProps) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
