import { PackageCheck, Store } from 'lucide-react';
import { ProductSearchResult } from '../../types/domain';
import { formatMoney } from '../../utils/formatters';

export function SearchResultCard({ result }: { result: ProductSearchResult }) {
  return (
    <article className="surface grid overflow-hidden sm:grid-cols-[220px_minmax(0,1fr)]">
      <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-950/70 sm:aspect-auto">
        <img
          src={result.imageUrl}
          alt={result.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="grid gap-4 p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-500/[0.14] dark:text-brand-100">{result.category}</span>
          </div>
          <h2 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{result.name}</h2>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {result.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <strong className="text-2xl font-black text-brand-600">{formatMoney(result.price)}</strong>
            <div className="mt-2 flex flex-wrap gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1">
                <PackageCheck size={16} /> Stock: {result.stock}
              </span>
              <span className="inline-flex items-center gap-1">
                <Store size={16} /> {result.seller}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}