import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type ProductModalProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function ProductModal({ title, isOpen, onClose, children }: ProductModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-4xl rounded-[36px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Panel administrativo</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-6">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
