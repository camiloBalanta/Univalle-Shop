import { ReceiptText } from 'lucide-react';
import { Order } from '../../types/domain';
import { formatDate, formatMoney } from '../../utils/formatters';

export function OrderCard({ order }: { order: Order }) {
  return (
    <article className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/40">
          <ReceiptText size={22} />
        </div>
        <div>
          <h3 className="font-black text-slate-950 dark:text-white">Orden #{order.id}</h3>
          <p className="text-sm text-muted">{formatDate(order.createdAt)}</p>
        </div>
      </div>
      <div className="text-left sm:text-right">
        <span className="badge bg-amber-100 text-amber-800">{order.status}</span>
        <p className="mt-2 text-lg font-black">{formatMoney(order.totalAmount)}</p>
      </div>
    </article>
  );
}
