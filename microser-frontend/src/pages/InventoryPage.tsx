import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { catalogService } from '../services/catalog.service';
import { useUiStore } from '../store/ui.store';

const createProductSchema = z.object({
  name: z.string().min(3, 'Nombre minimo 3 caracteres'),
  price: z.number().min(1, 'Precio debe ser mayor a 0'),
  description: z.string().min(10, 'Descripcion minimo 10 caracteres'),
  imageUrls: z.string().optional(),
});

type CreateProductFormValues = z.infer<typeof createProductSchema>;

export function InventoryPage() {
  const navigate = useNavigate();
  const notify = useUiStore((state) => state.notify);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { name: '', price: 0, description: '' },
  });

  async function onSubmit(values: CreateProductFormValues) {
    try {
      const images = values.imageUrls
      ? values.imageUrls
          .split(',')
          .map((url) => url.trim())
          .filter(Boolean)
      : [];

    await catalogService.createProduct({
      name: values.name,
      price: values.price,
      description: values.description,
      images,
    });
      notify({ type: 'success', title: 'Producto creado', message: 'El producto se guardo en el catalogo' });
      reset();
      navigate('/catalog');
    } catch (error) {
      notify({ type: 'error', title: 'Error creando producto', message: 'Verifica los datos y vuelve a intentar' });
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <span className="badge bg-campus-500/10 text-campus-600">Administracion de catalogo</span>
        <h1 className="mt-3 text-3xl font-black">Crear nuevo producto</h1>
        <p className="mt-1 text-muted">Registra productos reales para el microservicio de catalogo. Solo acceso administrativo.</p>
      </div>

      <section className="surface p-6">
        <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
            Nombre del producto
            <input className="input" type="text" placeholder="Ej. Laptop gamer" {...register('name')} />
            {errors.name && <span className="text-xs font-bold text-rose-500">{errors.name.message}</span>}
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
            Precio
            <input className="input" type="number" step="0.01" min="0" placeholder="Ej. 1599.99" {...register('price', { valueAsNumber: true })} />
            {errors.price && <span className="text-xs font-bold text-rose-500">{errors.price.message}</span>}
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
            Descripcion
            <textarea className="input min-h-[140px] resize-none" placeholder="Descripcion del producto" {...register('description')} />
            {errors.description && <span className="text-xs font-bold text-rose-500">{errors.description.message}</span>}
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
            URLs de imagenes
            <input
              className="input"
              type="text"
              placeholder="Ingresa URLs separadas por comas"
              {...register('imageUrls')}
            />
            <span className="text-xs text-muted">Puedes agregar varias imágenes separadas por comas.</span>
          </label>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              Crear producto
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/catalog')}>
              Volver al catalogo
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
