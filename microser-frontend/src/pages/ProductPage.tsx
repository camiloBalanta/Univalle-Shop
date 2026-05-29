import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, ShieldCheck, ShoppingCart, Star, Truck } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { ProductCarousel } from '../components/product/ProductCarousel';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { useProduct, useProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/cart.store';
import { useAuthStore } from '../store/auth.store';
import { useUiStore } from '../store/ui.store';
import { recommendationsService } from '../services/recommendations.service';
import { apiErrorMessage } from '../services/api.client';
import { formatMoney } from '../utils/formatters';
import { getProductImageUrl } from '../utils/image';

export function ProductPage() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: products = [] } = useProducts();
  const addProduct = useCartStore((state) => state.addProduct);
  const session = useAuthStore((state) => state.session);
  const notify = useUiStore((state) => state.notify);
  const queryClient = useQueryClient();
  const [review, setReview] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const { data: ratings = [] } = useQuery({
    queryKey: ['product-ratings', session?.userId],
    queryFn: () => recommendationsService.fetchRatings(session!.userId),
    enabled: Boolean(session?.userId && session?.token),
  });

  const currentProductRating = ratings.find((rating) => rating.productId === product?.id);
  const currentRating = currentProductRating?.rating ?? 0;

  useEffect(() => {
    if (currentProductRating) {
      setSelectedRating(currentProductRating.rating);
      setReview(currentProductRating.review ?? '');
    }
  }, [currentProductRating?.productId, currentProductRating?.rating, currentProductRating?.review]);

  const rateProductMutation = useMutation({
    mutationFn: (rating: number) =>
      recommendationsService.rateProduct({
        userId: session!.userId,
        productId: product!.id,
        productName: product!.name,
        category: product!.category,
        rating,
        review: review.trim() || undefined,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['product-ratings', session?.userId] }),
        queryClient.invalidateQueries({ queryKey: ['recommendations', session?.userId] }),
      ]);
      notify({
        type: 'success',
        title: 'Calificacion guardada',
        message: 'Actualizamos tus recomendaciones con este producto.',
      });
    },
    onError: (error: unknown) => {
      notify({
        type: 'error',
        title: 'No pudimos guardar tu calificacion',
        message: apiErrorMessage(error),
      });
    },
  });

  if (isLoading) return <ProductCardSkeleton />;
  if (!product) {
    return (
      <EmptyState
        title="Producto no encontrado"
        description="El microservicio de catalogo no devolvio un producto para este ID."
      />
    );
  }

  const imageUrl = getProductImageUrl(product);

  return (
    <div className="grid gap-8">
      <section className="surface grid gap-8 p-5 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
        <div className="grid min-h-[320px] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 dark:from-slate-800 dark:to-slate-900">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = 'https://placehold.co/600x400?text=Sin+Imagen';
              }}
            />
          ) : (
            <div className="grid min-h-[320px] place-items-center">
              <Package size={86} />
            </div>
          )}
        </div>
        <div>
          <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">{product.name}</h1>
          <p className="mt-5 text-lg text-muted dark:text-slate-300">
            {product.description || 'Sin descripcion registrada en el microservicio de catalogo.'}
          </p>
          <p className="mt-6 text-4xl font-black text-brand-600">{formatMoney(product.price)}</p>
          <div className="mt-6 grid gap-4">
            <div>
              <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                Tu calificacion
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-amber-400 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                    disabled={!session?.userId || rateProductMutation.isPending}
                    onClick={() => setSelectedRating(rating)}
                    aria-label={`Seleccionar ${rating} estrellas para ${product.name}`}
                  >
                    <Star
                      size={22}
                      fill={rating <= (selectedRating || currentRating) ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
                <span className="text-sm font-bold text-muted">
                  {session?.userId
                    ? currentRating
                      ? `${currentRating}/5`
                      : selectedRating
                        ? `Listo para guardar: ${selectedRating}/5`
                        : 'Sin calificar'
                    : 'Inicia sesion para calificar'}
                </span>
              </div>
              <button
                type="button"
                className="btn-primary mt-3 w-full max-w-xs"
                disabled={!session?.userId || selectedRating === 0 || rateProductMutation.isPending}
                onClick={() => rateProductMutation.mutate(selectedRating)}
              >
                Guardar calificación
              </button>
            </div>
            <div className="grid gap-2">
              <label htmlFor="product-review" className="text-sm font-black text-slate-700 dark:text-slate-200">
                Deja una reseña opcional
              </label>
              <textarea
                id="product-review"
                value={review}
                onChange={(event) => setReview(event.target.value)}
                rows={4}
                className="resize-none rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-500 dark:focus:ring-brand-500/20"
                placeholder="Cuéntanos qué te pareció este producto después de comprarlo"
                disabled={!session?.userId || rateProductMutation.isPending}
              />
              <p className="text-xs text-muted">
                La reseña se guardará junto a tu calificación.
              </p>
            </div>
          </div>
          {currentProductRating?.review ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <p className="font-black">Reseña previa</p>
              <p className="mt-2 whitespace-pre-wrap">{currentProductRating.review}</p>
            </div>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="btn-primary"
              onClick={() => {
                addProduct(product);
                notify({ type: 'success', title: 'Producto agregado', message: product.name });
              }}
            >
              <ShoppingCart size={18} /> Agregar al carrito
            </button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Info icon={Truck} title="Entrega" text="Preparado para conectar con ordenes." />
            <Info icon={ShieldCheck} title="Contrato real" text="Campos: id, name, price, description e imágenes." />
          </div>
        </div>
      </section>
      <ProductCarousel title="Mas productos del catalogo" products={products.filter((item) => item.id !== product.id).slice(0, 5)} />
    </div>
  );
}

function Info({ icon: Icon, title, text }: { icon: typeof Truck; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <Icon className="text-campus-600" size={22} />
      <h3 className="mt-3 font-black">{title}</h3>
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}