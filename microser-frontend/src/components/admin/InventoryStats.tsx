import { motion } from 'framer-motion';
import { BarChart3, Box, TrendingUp, Truck, Wallet } from 'lucide-react';

type InventoryStatsProps = {
  totalItems: number;
  totalStock: number;
  totalValue: number;
  outOfStock: number;
  lowStock: number;
};

const cards = [
  {
    title: 'Productos registrados',
    icon: <Box size={24} />,
    key: 'totalItems',
    valueKey: 'totalItems',
  },
  {
    title: 'Stock total',
    icon: <Truck size={24} />,
    key: 'totalStock',
    valueKey: 'totalStock',
  },
  {
    title: 'Valor estimado',
    icon: <Wallet size={24} />,
    key: 'totalValue',
    valueKey: 'totalValue',
  },
  {
    title: 'Bajo stock',
    icon: <TrendingUp size={24} />,
    key: 'lowStock',
    valueKey: 'lowStock',
  },
  {
    title: 'Agotados',
    icon: <BarChart3 size={24} />,
    key: 'outOfStock',
    valueKey: 'outOfStock',
  },
];

export function InventoryStats(props: InventoryStatsProps) {
  const values = {
    totalItems: props.totalItems,
    totalStock: props.totalStock,
    totalValue: props.totalValue,
    outOfStock: props.outOfStock,
    lowStock: props.lowStock,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card, index) => (
        <motion.article
          key={card.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.05 }}
          className="surface rounded-[32px] border border-slate-200/70 bg-white/90 p-5 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950/80"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="grid rounded-3xl bg-slate-900/95 p-3 text-white shadow-sm">
              {card.icon}
            </div>
            <span className="text-xs font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              {card.title}
            </span>
          </div>
          <p className="mt-6 text-4xl font-black text-slate-950 dark:text-white">
            {card.valueKey === 'totalValue' ? `$${values[card.valueKey].toFixed(2)}` : values[card.valueKey]}
          </p>
        </motion.article>
      ))}
    </div>
  );
}
