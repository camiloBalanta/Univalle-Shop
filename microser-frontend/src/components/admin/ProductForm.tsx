import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Product } from '../../types/domain';
import { UploadZone } from './UploadZone';

export type ProductFormValues = {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  images: string[];
};

type ProductFormProps = {
  product?: Product;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
};

const categoryOptions = [
  'Ropa',
  'Electrónica',
  'Hogar',
  'Belleza',
  'Deportes',
  'Coleccionables',
];

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: {
      id: product?.id,
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      category: product?.category ?? 'Ropa',
      imageUrl: product?.imageUrl ?? '',
      images: product?.images ?? [],
    },
  });

  useEffect(() => {
    reset({
      id: product?.id,
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      category: product?.category ?? 'Ropa',
      imageUrl: product?.imageUrl ?? '',
      images: product?.images ?? [],
    });
  }, [product, reset]);

  const images = watch('images');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 rounded-[32px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/70">
          <div>
            <label className="text-sm font-black text-slate-700 dark:text-slate-200">Nombre del producto</label>
            <input
              {...register('name', { required: 'Este campo es requerido' })}
              className="input mt-2"
              placeholder="Nombre del producto"
            />
            {errors.name ? <p className="mt-2 text-sm text-rose-600">{errors.name.message}</p> : null}
          </div>

          <div>
            <label className="text-sm font-black text-slate-700 dark:text-slate-200">Descripción</label>
            <textarea
              {...register('description')}
              rows={4}
              className="input mt-2 min-h-[170px] resize-none"
              placeholder="Describe brevemente el producto..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-black text-slate-700 dark:text-slate-200">Precio</label>
              <input
                {...register('price', {
                  valueAsNumber: true,
                  min: { value: 0.01, message: 'Precio debe ser mayor a 0' },
                  required: 'Este campo es requerido',
                })}
                type="number"
                step="0.01"
                className="input mt-2"
                placeholder="0.00"
              />
              {errors.price ? <p className="mt-2 text-sm text-rose-600">{errors.price.message}</p> : null}
            </div>
            <div>
              <label className="text-sm font-black text-slate-700 dark:text-slate-200">Stock</label>
              <input
                {...register('stock', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Stock no puede ser negativo' },
                  required: 'Este campo es requerido',
                })}
                type="number"
                className="input mt-2"
                placeholder="0"
              />
              {errors.stock ? <p className="mt-2 text-sm text-rose-600">{errors.stock.message}</p> : null}
            </div>
          </div>

          <div>
            <label className="text-sm font-black text-slate-700 dark:text-slate-200">Categoría</label>
            <select {...register('category')} className="input mt-2">
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-black text-slate-700 dark:text-slate-200">URL de imagen principal</label>
            <input
              {...register('imageUrl')}
              type="url"
              className="input mt-2"
              placeholder="https://..."
            />
          </div>
        </div>

        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <UploadZone images={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary px-6 py-3">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary px-6 py-3">
          {product ? 'Actualizar producto' : 'Crear producto'}
        </button>
      </div>
    </form>
  );
}
