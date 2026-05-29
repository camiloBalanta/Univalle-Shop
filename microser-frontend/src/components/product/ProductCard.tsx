import { motion } from 'framer-motion';
import { Package, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cart.store';
import { useUiStore } from '../../store/ui.store';
import { Product } from '../../types/domain';
import { formatMoney } from '../../utils/formatters';
import { getProductImageUrl } from '../../utils/image';

export function ProductCard({ product }: { product: Product }) {
  const addProduct = useCartStore((state) => state.addProduct);
  const notify = useUiStore((state) => state.notify);

  const imageUrl = getProductImageUrl(product);

  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.18 }}
      className="surface grid overflow-hidden p-5"
    >
      <Link to={`/products/${product.id}`} className="grid gap-4">
        <div className="grid aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 dark:from-slate-800 dark:to-slate-950 dark:text-slate-400">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = 'https://placehold.co/600x400?text=Sin+Imagen';
              }}
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <Package size={42} />
            </div>
          )}
        </div>
        <div>
          <span className="badge bg-campus-500/10 text-campus-600 dark:bg-campus-500/[0.12] dark:text-slate-100">Catalogo</span>
          <h3 className="mt-3 line-clamp-2 min-h-12 text-base font-black text-slate-950 transition hover:text-brand-600 dark:text-white">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm text-muted dark:text-slate-400">
            {product.description || 'Sin descripcion registrada en catalogo.'}
          </p>
        </div>
      </Link>
      <div className="mt-5 flex items-center justify-between gap-3">
        <strong className="text-xl text-slate-950 dark:text-white">{formatMoney(product.price)}</strong>
        <button
          className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-white transition hover:bg-brand-600 dark:bg-brand-500 dark:text-white dark:hover:bg-brand-600"
          onClick={() => {
            addProduct(product);
            notify({ type: 'success', title: 'Producto agregado', message: product.name });
          }}
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <ShoppingCart size={18} />
        </button>
      </div>
    </motion.article>
  );
}