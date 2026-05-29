import { CreditCard, LockKeyhole } from 'lucide-react';

export function CheckoutForm({ onSubmit }: { onSubmit: () => void }) {
  return (
    <form
      className="surface grid gap-4 p-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h2 className="text-xl font-black">Pago y entrega</h2>
      <input className="input" placeholder="Nombre completo" />
      <input className="input" placeholder="Correo institucional" />
      <input className="input" placeholder="Punto de entrega en campus" />
      <button className="btn-primary">
        <CreditCard size={18} /> Confirmar compra
      </button>
      <p className="flex items-center gap-2 text-xs font-bold text-muted">
        <LockKeyhole size={14} /> Revisa tus datos antes de finalizar la compra.
      </p>
    </form>
  );
}