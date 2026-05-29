import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchResultCard } from '../features/search/SearchResultCard';
import { searchService } from '../services/search.service';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const [queryValue, setQueryValue] = useState(q);
  const [categoryValue, setCategoryValue] = useState(category);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search-service', q, category],
    queryFn: () => searchService.searchProducts({ q, category }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams();
    if (queryValue.trim()) next.set('q', queryValue.trim());
    if (categoryValue.trim()) next.set('category', categoryValue.trim());
    setParams(next);
  }

  return (
    <div className="grid gap-6">
      <section className="surface p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="badge bg-campus-500/10 text-campus-600">Microservicio de busqueda</span>
            <h1 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
              Resultados
            </h1>
          </div>

          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto] lg:min-w-[680px]">
            <input
              className="input"
              value={queryValue}
              onChange={(event) => setQueryValue(event.target.value)}
              placeholder="q: nombre, descripcion, categoria o vendedor"
            />
            <input
              className="input"
              value={categoryValue}
              onChange={(event) => setCategoryValue(event.target.value)}
              placeholder="category"
            />
            <button className="btn-primary">
              <Search size={18} /> Buscar
            </button>
          </form>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
        <span className="rounded-2xl bg-white px-4 py-2 shadow-sm dark:bg-slate-900">
          query: {data?.query || q || 'vacio'}
        </span>
        <span className="rounded-2xl bg-white px-4 py-2 shadow-sm dark:bg-slate-900">
          category: {data?.category || category || 'vacia'}
        </span>
        <span className="rounded-2xl bg-white px-4 py-2 shadow-sm dark:bg-slate-900">
          total: {data?.total ?? 0}
        </span>
      </section>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-48" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="No se pudo consultar busqueda"
          description="El frontend no usa fallback aqui: revisa search-service o su coleccion product_search_results."
        />
      ) : data?.results.length ? (
        <div className="grid gap-4">
          {data.results.map((result) => (
            <SearchResultCard key={result.productId} result={result} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Sin resultados"
          description="no se encontraron resultados para esta consulta."
        />
      )}
    </div>
  );
}
