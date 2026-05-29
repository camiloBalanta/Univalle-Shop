import { useQuery } from '@tanstack/react-query';
import { OrderCard } from '../components/shared/OrderCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { ordersService } from '../services/orders.service';
import { useAuthStore } from '../store/auth.store';

export function OrdersPage() {
  const session = useAuthStore((state) => state.session);
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', session?.userId],
    queryFn: () => ordersService.listUserOrders(session?.userId || ''),
    enabled: Boolean(session?.userId),
    retry: false,
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">Historial de ordenes</h1>
          <p className="mt-2 max-w-xl text-sm font-semibold text-muted">
            Consulta tus compras recientes y revisa el estado de cada pedido en un solo lugar.
          </p>
        </div>
      </div>
      {isLoading ? (
        <div className="grid gap-4">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-24" />)}</div>
      ) : orders.length ? (
        <div className="grid gap-4">{orders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
      ) : (
        <EmptyState title="Aun no tienes ordenes" description="Cuando compres, tu historial aparecera aqui." />
      )}
    </div>
  );
}