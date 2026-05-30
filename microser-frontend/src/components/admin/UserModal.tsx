import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface UserModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function UserModal({ title, isOpen, onClose, children }: UserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-[40px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Completa el formulario para actualizar los datos del usuario institucional.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
