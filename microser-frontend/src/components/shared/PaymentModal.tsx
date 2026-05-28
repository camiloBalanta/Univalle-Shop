import { CreditCard } from 'lucide-react';

export function PaymentModal() {
  return (
    <div className="surface p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-campus-500 text-white">
          <CreditCard size={22} />
        </div>
        <div>
          <h3 className="font-black">Pago seguro</h3>
          <p className="text-sm text-muted">
            Usa el endpoint real `/payment/simulate/:orderId` con `amount` y `customerId`.
          </p>
        </div>
      </div>
    </div>
  );
}
