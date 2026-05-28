export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="surface overflow-hidden p-3">
      <Skeleton className="aspect-[4/3]" />
      <div className="space-y-3 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
