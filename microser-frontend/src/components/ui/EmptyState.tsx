import { PackageSearch } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="surface grid min-h-[240px] place-items-center p-8 text-center">
      <div>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/[0.07] dark:text-slate-300">
          <PackageSearch size={26} />
        </div>
        <h3 className="text-lg font-black text-slate-950 dark:text-white">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-muted dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}