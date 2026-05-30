import { useMemo, useState } from 'react';
import { CreditCard, ShieldCheck, X } from 'lucide-react';

type PaymentFormValues = {
  cardNumber: string;
  cardHolder: string;
  expiration: string;
  cvv: string;
};

type PaymentFormErrors = Partial<Record<keyof PaymentFormValues, string>>;

type PaymentModalProps = {
  open: boolean;
  amount: number;
  currency?: string;
  onClose: () => void;
  onConfirm: (paymentData: PaymentFormValues) => void;
};

const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

const normalizeExpiration = (value: string) =>
  value
    .replace(/[^0-9]/g, '')
    .slice(0, 4)
    .replace(/^(\d{2})(\d{1,2})?$/, (_, month, year) => (year ? `${month}/${year}` : month));

export function PaymentModal({ open, amount, currency = 'COP', onClose, onConfirm }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiration, setExpiration] = useState('');
  const [cvv, setCvv] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo<PaymentFormErrors>(() => {
    const result: PaymentFormErrors = {};
    const cleanedCardNumber = cardNumber.replace(/\D/g, '');
    const cleanedExpiration = expiration.replace(/\s/g, '');

    if (!cleanedCardNumber) {
      result.cardNumber = 'Ingresa el número de tarjeta.';
    } else if (cleanedCardNumber.length !== 16) {
      result.cardNumber = 'El número de tarjeta debe tener 16 dígitos.';
    }

    if (!cardHolder.trim()) {
      result.cardHolder = 'Ingresa el nombre del titular.';
    }

    if (!cleanedExpiration) {
      result.expiration = 'Ingresa la fecha de expiración.';
    } else if (!/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(cleanedExpiration)) {
      result.expiration = 'Formato válido: MM/AA.';
    } else {
      const [month, yearRaw] = cleanedExpiration.split('/');
      const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
      const expires = new Date(Number(year), Number(month) - 1, 1);
      const now = new Date();
      now.setDate(1);
      if (expires < now) {
        result.expiration = 'La tarjeta está expirada.';
      }
    }

    if (!cvv) {
      result.cvv = 'Ingresa el CVV.';
    } else if (!/^\d{3,4}$/.test(cvv)) {
      result.cvv = 'El CVV debe tener 3 o 4 dígitos.';
    }

    return result;
  }, [cardNumber, cardHolder, expiration, cvv]);

  const hasErrors = Object.keys(errors).length > 0;

  const handleSubmit = () => {
    setSubmitted(true);
    if (hasErrors) return;

    onConfirm({
      cardNumber: cardNumber.replace(/\s/g, ''),
      cardHolder: cardHolder.trim(),
      expiration,
      cvv,
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-campus-500 text-white">
              <CreditCard size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black">Confirmar compra</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Ingresa los datos de tu tarjeta para simular el pago seguro.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={onClose}
            aria-label="Cerrar modal de pago"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Monto a pagar</span>
            <strong>{amount.toLocaleString('es-CO', { style: 'currency', currency })}</strong>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Pago simulado profesional. No se cargará ninguna tarjeta real.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
            Número de tarjeta
            <input
              type="text"
              inputMode="numeric"
              maxLength={19}
              value={cardNumber}
              onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
              placeholder="1234 5678 9012 3456"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-campus-500 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            {submitted && errors.cardNumber ? (
              <span className="text-xs text-red-600">{errors.cardNumber}</span>
            ) : null}
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
            Nombre del titular
            <input
              type="text"
              value={cardHolder}
              onChange={(event) => setCardHolder(event.target.value)}
              placeholder="Nombre completo"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-campus-500 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            {submitted && errors.cardHolder ? (
              <span className="text-xs text-red-600">{errors.cardHolder}</span>
            ) : null}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
              Expiración
              <input
                type="text"
                inputMode="numeric"
                maxLength={7}
                value={expiration}
                onChange={(event) => setExpiration(normalizeExpiration(event.target.value))}
                placeholder="MM/AA"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-campus-500 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              {submitted && errors.expiration ? (
                <span className="text-xs text-red-600">{errors.expiration}</span>
              ) : null}
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
              CVV
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={cvv}
                onChange={(event) => setCvv(event.target.value.replace(/\D/g, ''))}
                placeholder="123"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-campus-500 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              {submitted && errors.cvv ? (
                <span className="text-xs text-red-600">{errors.cvv}</span>
              ) : null}
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Pago seguro</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tus datos permanecen confidenciales en esta simulación.</p>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center justify-center rounded-full bg-campus-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-campus-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
          >
            <ShieldCheck className="mr-2" size={16} />
            Confirmar pago
          </button>
        </div>
      </div>
    </div>
  );
}
