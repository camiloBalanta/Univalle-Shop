import { Package, Sparkles } from 'lucide-react';
import { Product } from '../../types/domain';
import { formatMoney } from '../../utils/formatters';

export function RecommendationCard({ product }: { product: Product }) {
  return (
    <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid h-20 w-20 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800">
        <Package size={24} />
      </div>
      <div className="min-w-0">
        <span className="inline-flex items-center gap-1 text-xs font-black text-campus-600">
          <Sparkles size={14} /> Recomendado
        </span>
        <h3 className="mt-1 line-clamp-1 font-black text-slate-950 dark:text-white">{product.name}</h3>
        <p className="text-sm font-bold text-brand-600">{formatMoney(product.price)}</p>
      </div>
    </article>
  );
}
