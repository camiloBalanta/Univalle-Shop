import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CheckoutForm } from '../components/cart/CheckoutForm';
import { EmptyState } from '../components/ui/EmptyState';
import { PaymentModal, type PaymentFormValues } from '../components/shared/PaymentModal';
import { ordersService } from '../services/orders.service';
import { paymentsService } from '../services/payments.service';
import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '../store/cart.store';
import { useUiStore } from '../store/ui.store';
import { formatMoney } from '../utils/formatters';

export function CheckoutPage() {
  const session = useAuthStore((state) => state.session);
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const notify = useUiStore((state) => state.notify);
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const checkout = useMutation({
    mutationFn: async (paymentData: PaymentFormValues) => {
      const order = await ordersService.createOrder({
        customerId: session?.userId || 'guest',
        items,
        totalAmount: total,
      });
      const payment = await paymentsService.simulate(order.id, {
        amount: order.totalAmount,
        customerId: session?.userId || 'guest',
        paymentMethod: 'CARD',
        cardNumber: paymentData.cardNumber,
        cardHolder: paymentData.cardHolder,
        expiration: paymentData.expiration,
        cvv: paymentData.cvv,
      });
      return { order, payment };
    },
    onSuccess: ({ order, payment }) => {
      if (payment.status === 'approved') {
        clear();
        queryClient.invalidateQueries({ queryKey: ['products'] });
        order.items.forEach((item) => {
          queryClient.invalidateQueries({ queryKey: ['product', item.productId] });
        });
        notify({ type: 'success', title: 'Pago aprobado', message: 'Tu pedido ha sido confirmado correctamente.' });
      } else {
        notify({ type: 'error', title: 'Pago rechazado', message: payment.message });
      }
    },
    onError: () => {
      notify({
        type: 'error',
        title: 'No se pudo procesar la compra',
        message: 'No se pudo completar tu compra. Intenta nuevamente en unos minutos.',
      });
    },
  });

  if (!items.length) {
    return <EmptyState title="Tu carrito esta vacio" description="Agrega productos antes de continuar al checkout." />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <CheckoutForm onSubmit={() => setShowPaymentModal(true)} />
      <aside className="surface h-fit p-6">
        <PaymentModal
          open={showPaymentModal}
          amount={total}
          currency="COP"
          onClose={() => setShowPaymentModal(false)}
          onConfirm={(paymentData) => {
            setShowPaymentModal(false);
            checkout.mutate(paymentData);
          }}
        />
        <div className="mt-6">
          <h2 className="text-xl font-black">Resumen</h2>
          <div className="mt-5 grid gap-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between gap-4 text-sm">
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  {item.name} x{item.quantity}
                </span>
                <strong>{formatMoney(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between border-t border-slate-200 pt-5 text-xl font-black dark:border-slate-800">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
          {checkout.isPending && (
            <p className="mt-4 text-sm text-muted">Procesando tu pago de forma segura...</p>
          )}
          {checkout.isError && (
            <p className="mt-4 text-sm font-bold text-red-700">
              No se pudo procesar tu pago. Intenta nuevamente.
            </p>
          )}
          {checkout.data && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-bold">Estado del pago: {checkout.data.payment.status}</p>
              <p className="text-sm text-muted">{checkout.data.payment.message}</p>
              <p className="mt-3 text-xs text-slate-500">
                Podrás consultar el estado de tu pedido desde tu cuenta.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
