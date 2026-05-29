import { Search, SlidersHorizontal } from 'lucide-react';

type InventoryFiltersProps = {
  query: string;
  category: string;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

const categories = ['Todos', 'Ropa', 'Electrónica', 'Hogar', 'Belleza', 'Deportes', 'Coleccionables'];

export function InventoryFilters({ query, category, onQueryChange, onCategoryChange }: InventoryFiltersProps) {
  return (
    <div className="grid gap-4 rounded-[32px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-brand-700">Inventario</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Buscar y filtrar productos</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-500">
            <SlidersHorizontal size={18} /> Ajustes rápidos
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1.8fr_1fr]">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Buscar producto</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Nombre, ID, categoría..."
              className="input pl-11"
            />
          </div>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Filtrar por categoría</span>
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="input"
          >
            {categories.map((option) => (
              <option key={option} value={option === 'Todos' ? '' : option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
