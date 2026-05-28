import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <span className="text-8xl font-black text-brand-600">404</span>
        <h1 className="mt-4 text-3xl font-black">Pagina no encontrada</h1>
        <p className="mt-2 text-muted">La ruta no existe o fue movida.</p>
        <Link to="/" className="btn-primary mt-6">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
