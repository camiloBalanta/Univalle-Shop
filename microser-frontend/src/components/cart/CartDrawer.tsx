import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Package, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cart.store';
import { useUiStore } from '../../store/ui.store';
import { formatMoney } from '../../utils/formatters';

export function CartDrawer() {
  const open = useUiStore((state) => state.cartOpen);
  const toggleCart = useUiStore((state) => state.toggleCart);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-slate-950/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleCart} />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="fixed right-0 top-0 z-50 flex h-screen w-[min(440px,100vw)] flex-col bg-white shadow-soft dark:bg-slate-950"
          >
            <header className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-black">Carrito</h2>
                <p className="text-sm text-muted">{items.length} productos seleccionados</p>
              </div>
              <button className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800" onClick={toggleCart}>
                <X size={19} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <ShoppingBag className="mx-auto text-slate-300" size={54} />
                    <h3 className="mt-4 text-lg font-black">Tu carrito esta vacio</h3>
                    <p className="mt-1 text-sm text-muted">Explora productos y agrega tus favoritos.</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {items.map((item) => (
                    <article key={item.productId} className="flex gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                      <div className="grid h-20 w-20 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full rounded-xl object-cover" />
                        ) : (
                          <Package size={24} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-black">{item.name}</h3>
                        <p className="mt-1 text-sm font-bold text-brand-600">{formatMoney(item.price)}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700">
                            <button className="grid h-8 w-8 place-items-center" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                              <Minus size={14} />
                            </button>
                            <span className="grid h-8 w-8 place-items-center text-sm font-black">{item.quantity}</span>
                            <button className="grid h-8 w-8 place-items-center" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                              <Plus size={14} />
                            </button>
                          </div>
                          <button className="text-rose-500" onClick={() => removeItem(item.productId)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
            <footer className="border-t border-slate-200 p-5 dark:border-slate-800">
              <div className="mb-4 flex items-center justify-between text-lg font-black">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
              <Link to="/checkout" onClick={toggleCart} className="btn-primary w-full">
                Ir a checkout
              </Link>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
