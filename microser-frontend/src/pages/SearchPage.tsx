import { useQuery } from '@tanstack/react-query';
import { ListFilter, Search, Sparkles, Tag } from 'lucide-react';
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
  const activeQuery = data?.query || q;
  const activeCategory = data?.category || category;
  const totalResults = data?.total ?? 0;

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams();
    if (queryValue.trim()) next.set('q', queryValue.trim());
    if (categoryValue.trim()) next.set('category', categoryValue.trim());
    setParams(next);
  }

  return (
    <div className="grid gap-6">
      <section className="surface p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(420px,1.15fr)] lg:items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white">
              Buscar productos
            </h1>
            <p className="mt-2 max-w-xl text-sm font-semibold text-muted">
              Encuentra articulos por nombre, descripcion, categoria o vendedor.
            </p>
          </div>

          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto]">
            <label className="grid gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
              Producto o palabra clave
              <input
                className="input h-11"
                value={queryValue}
                onChange={(event) => setQueryValue(event.target.value)}
                placeholder="Buscar por nombre o vendedor"
              />
            </label>
            <label className="grid gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
              Categoria
              <input
                className="input h-11"
                value={categoryValue}
                onChange={(event) => setCategoryValue(event.target.value)}
                placeholder="Todas"
              />
            </label>
            <button className="btn-primary h-11 self-end justify-center">
              <Search size={18} /> Buscar
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <span className="inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          <ListFilter size={18} className="text-campus-600 dark:text-campus-300" />
          {activeQuery || activeCategory ? 'Filtros aplicados' : 'Sin filtros aplicados'}
        </span>
        <span className="inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          <Tag size={18} className="text-brand-600 dark:text-brand-300" />
          {activeCategory || 'Todas las categorias'}
        </span>
        <span className="inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          <Sparkles size={18} className="text-amber-500" />
          {totalResults} resultados encontrados
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
          title="No pudimos cargar los resultados"
          description="Intenta nuevamente en unos segundos o ajusta los filtros de busqueda."
        />
      ) : data?.results.length ? (
        <div className="grid gap-4">
          {data.results.map((result) => (
            <SearchResultCard key={result.productId} result={result} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No encontramos productos"
          description="Prueba con otra palabra clave, revisa la categoria o elimina los filtros aplicados."
        />
      )}
    </div>
  );
}