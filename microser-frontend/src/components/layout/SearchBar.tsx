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
    <form onSubmit={onSubmit} className="flex min-w-0 flex-1 items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="grid h-11 w-11 place-items-center text-slate-400">
        <Search size={20} />
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar productos, categorias, libros, tecnologia..."
        className="h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
      />
      <button className="btn-primary h-11">Buscar</button>
    </form>
  );
}
