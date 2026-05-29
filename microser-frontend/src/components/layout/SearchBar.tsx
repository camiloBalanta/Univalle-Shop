import { Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-1 items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm transition focus-within:border-campus-500 focus-within:ring-4 focus-within:ring-campus-500/10 dark:border-white/10 dark:bg-white/[0.07] dark:shadow-none dark:focus-within:border-campus-500 dark:focus-within:ring-campus-500/15">
      <div className="grid h-11 w-11 place-items-center text-slate-400 dark:text-slate-500">
        <Search size={20} />
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar productos, categorias, libros, tecnologia..."
        className="h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
      <button className="btn-primary h-11">Buscar</button>
    </form>
  );
}