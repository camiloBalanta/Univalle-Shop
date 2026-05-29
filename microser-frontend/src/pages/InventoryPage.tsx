import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { catalogService } from '../services/catalog.service';
import { useProducts } from '../hooks/useProducts';
import { useUiStore } from '../store/ui.store';
import { Product } from '../types/domain';
import { normalizeImageUrl } from '../utils/image';
import { EmptyState } from '../components/ui/EmptyState';
import { InventoryFilters } from '../components/admin/InventoryFilters';
import { InventoryStats } from '../components/admin/InventoryStats';
import { ProductPreviewCard } from '../components/admin/ProductPreviewCard';
import { ProductModal } from '../components/admin/ProductModal';
import { ProductForm, ProductFormValues } from '../components/admin/ProductForm';

export function InventoryPage() {
  const notify = useUiStore((state) => state.notify);
  const queryClient = useQueryClient();
  const { data: products = [], isLoading: isProductsLoading, isError: isProductsError } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = searchQuery
        ? [product.name, product.category, product.description, product.id]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      const matchesCategory = categoryFilter ? product.category === categoryFilter : true;

      return matchesQuery && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const inventoryStats = useMemo(() => {
    const totalItems = products.length;
    const totalStock = products.reduce((acc, product) => acc + (product.stock ?? 0), 0);
    const totalValue = products.reduce((acc, product) => acc + ((product.price ?? 0) * (product.stock ?? 0)), 0);
    const outOfStock = products.filter((product) => (product.stock ?? 0) === 0).length;
    const lowStock = products.filter((product) => (product.stock ?? 0) > 0 && product.stock! <= 5).length;

    return { totalItems, totalStock, totalValue, outOfStock, lowStock };
  }, [products]);

  const openCreateModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  async function handleSubmit(values: ProductFormValues) {
    try {
      const images = values.images?.length ? values.images.map(normalizeImageUrl).filter(Boolean) : [];

      const payload: Partial<Product> = {
        name: values.name,
        description: values.description,
        category: values.category,
        price: values.price,
        stock: values.stock,
        images,
      };

      if (values.imageUrl) {
        const normalizedImage = normalizeImageUrl(values.imageUrl);
        if (normalizedImage) payload.imageUrl = normalizedImage;
      } else if (images.length > 0) {
        payload.imageUrl = images[0];
      }

      if (selectedProduct) {
        await catalogService.updateProduct(selectedProduct.id, payload);
        notify({ type: 'success', title: 'Producto actualizado', message: 'El producto se actualizó correctamente.' });
      } else {
        await catalogService.createProduct(payload);
        notify({ type: 'success', title: 'Producto creado', message: 'El producto se guardó en el catálogo.' });
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    } catch (error) {
      notify({ type: 'error', title: 'Error al guardar producto', message: 'Verifica los datos e intenta de nuevo.' });
    }
  }

  async function handleDeleteProduct(product: Product) {
    if (!window.confirm(`¿Eliminar ${product.name}? Esta acción no se puede deshacer.`)) return;

    try {
      await catalogService.deleteProduct(product.id);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      notify({ type: 'success', title: 'Producto eliminado', message: 'El producto fue eliminado del catálogo.' });
    } catch (error) {
      notify({ type: 'error', title: 'Error eliminando producto', message: 'No se pudo borrar el producto. Intenta de nuevo.' });
    }
  }

  async function handleSyncSearchIndex() {
    try {
      const result = await catalogService.syncSearchIndex();
      notify({ type: 'success', title: 'Búsqueda sincronizada', message: `${result.synced} de ${result.total} productos enviados al índice.` });
    } catch (error) {
      notify({ type: 'error', title: 'Error sincronizando búsqueda', message: 'Revisa que el microservicio de búsqueda esté disponible.' });
    }
  }

  return (
    <div className="grid gap-8">
      <header className="grid gap-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-sm font-black uppercase tracking-[0.28em] text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              Administración premium
            </span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              Dashboard de inventario
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Gestiona productos, revisa stock y lanza actualizaciones de catálogo con un panel profesional inspirado en Amazon/Shopify.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-secondary" onClick={handleSyncSearchIndex}>
              Sincronizar búsqueda
            </button>
            <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={openCreateModal}>
              <Plus size={16} /> Nuevo producto
            </button>
          </div>
        </div>

        <InventoryStats
          totalItems={inventoryStats.totalItems}
          totalStock={inventoryStats.totalStock}
          totalValue={inventoryStats.totalValue}
          lowStock={inventoryStats.lowStock}
          outOfStock={inventoryStats.outOfStock}
        />
      </header>

      <InventoryFilters
        query={searchQuery}
        category={categoryFilter}
        onQueryChange={setSearchQuery}
        onCategoryChange={setCategoryFilter}
      />

      <section className="grid gap-6">
        {isProductsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-80 rounded-[32px] border border-slate-200 bg-slate-100/80 shadow-sm animate-pulse dark:border-slate-800 dark:bg-slate-900/80" />
            ))}
          </div>
        ) : isProductsError ? (
          <EmptyState title="No se puede cargar el inventario" description="Revisa el microservicio de catálogo o la conexión a la API." />
        ) : filteredProducts.length ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductPreviewCard
                key={product.id}
                product={product}
                onEdit={openEditModal}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No hay productos que coincidan" description="Ajusta los filtros o crea un nuevo producto para comenzar." />
        )}
      </section>

      <ProductModal title={selectedProduct ? 'Editar producto' : 'Crear producto'} isOpen={isModalOpen} onClose={closeModal}>
        <ProductForm product={selectedProduct ?? undefined} onSubmit={handleSubmit} onCancel={closeModal} />
      </ProductModal>
    </div>
  );
}
