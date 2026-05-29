import clsx from 'clsx';

type CategoryBadgeProps = {
  category?: string;
};

const palette: Record<string, string> = {
  Tecnologia: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-200',
  Libros: 'bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-200',
  Oficina: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200',
  Gaming: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/30 dark:text-fuchsia-200',
  Utiles: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200',
};

export function CategoryBadge({ category = 'General' }: CategoryBadgeProps) {
  const classes = clsx(
    'inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]',
    palette[category] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-200',
  );

  return <span className={classes}>{category}</span>;
}
