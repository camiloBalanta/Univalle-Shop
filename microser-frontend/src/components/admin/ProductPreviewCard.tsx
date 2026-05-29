import { motion } from 'framer-motion';
import { Edit, Star, Trash2 } from 'lucide-react';
import { getProductImageUrl } from '../../utils/image';
import { Product } from '../../types/domain';
import { CategoryBadge } from './CategoryBadge';
import { StockBadge } from './StockBadge';

type ProductPreviewCardProps = {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

function getRating(stock?: number) {
  if (stock === undefined) return 4.2;
  if (stock === 0) return 3.1;
  if (stock <= 5) return 3.9;
  if (stock <= 15) return 4.4;
  return 4.8;
}

export function ProductPreviewCard({ product, onEdit, onDelete }: ProductPreviewCardProps) {
  const imageUrl = getProductImageUrl(product);
  const rating = getRating(product.stock);
  const stars = Array.from({ length: 5 }, (_, index) => index + 1);

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:border-slate-300 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="relative overflow-hidden bg-slate-100">
        <img src={imageUrl} alt={product.name} className="h-52 w-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <CategoryBadge category={product.category} />
          <StockBadge stock={product.stock} />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-black text-slate-950 dark:text-white">{product.name}</p>
          <span className="text-sm font-black text-slate-500 dark:text-slate-400">ID {product.id}</span>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {product.description ?? 'Producto sin descripción completa.'}
        </p>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            {stars.map((star) => (
              <Star
                key={star}
                size={14}
                fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
                className={star <= Math.round(rating) ? 'text-amber-500' : 'text-slate-300'}
              />
            ))}
          </div>
          <span className="font-bold text-slate-700 dark:text-slate-200">{rating.toFixed(1)}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xl font-black text-brand-600">${product.price.toFixed(2)}</p>
            <p className="text-sm text-muted">{product.stock ?? 0} unidades</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Edit size={16} /> Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(product)}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
            >
              <Trash2 size={16} /> Eliminar
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
