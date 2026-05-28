import { create } from 'zustand';
import { CartItem, Product } from '../types/domain';

type CartState = {
  items: CartItem[];
  addProduct: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addProduct: (product) =>
    set((state) => {
      const item = state.items.find((entry) => entry.productId === product.id);
      if (item) {
        return {
          items: state.items.map((entry) =>
            entry.productId === product.id ? { ...entry, quantity: entry.quantity + 1 } : entry,
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ],
      };
    }),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    })),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
  clear: () => set({ items: [] }),
}));
