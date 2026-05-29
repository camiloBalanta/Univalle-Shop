import clsx from 'clsx';

type StockBadgeProps = {
  stock?: number;
};

export function StockBadge({ stock }: StockBadgeProps) {
  const status = stock === 0 ? 'agotado' : stock <= 5 ? 'bajo stock' : 'disponible';
  const baseClass = 'inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]';

  const classes = clsx(baseClass, {
    'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200': status === 'agotado',
    'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200': status === 'bajo stock',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200': status === 'disponible',
  });

  return <span className={classes}>{status}</span>;
}
