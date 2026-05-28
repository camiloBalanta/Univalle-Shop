import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useUiStore } from '../../store/ui.store';

export function NotificationCenter() {
  const notifications = useUiStore((state) => state.notifications);
  const dismiss = useUiStore((state) => state.dismiss);

  return (
    <div className="fixed right-4 top-24 z-50 grid w-[min(380px,calc(100vw-2rem))] gap-3">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 32, y: -12 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 32 }}
            className={`rounded-2xl border bg-white p-4 shadow-soft dark:bg-slate-900 ${
              notification.type === 'error'
                ? 'border-rose-200'
                : notification.type === 'success'
                  ? 'border-emerald-200'
                  : 'border-sky-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <strong className="text-sm text-slate-950 dark:text-white">{notification.title}</strong>
                {notification.message && (
                  <p className="mt-1 text-sm text-muted dark:text-slate-400">{notification.message}</p>
                )}
              </div>
              <button onClick={() => dismiss(notification.id)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
