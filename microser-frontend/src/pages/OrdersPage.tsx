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
      <div>
        <h1 className="text-3xl font-black">Historial de ordenes</h1>
        <p className="mt-1 text-muted">Esta vista usa solo el endpoint real `/orders/user/:userId`.</p>
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
