import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, AlertCircle, Package, TrendingUp, Percent } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

export default function FinancialStatsCards({
  totalSales,
  totalExpenses,
  totalDebts,
  totalInventoryCost,
  totalProfit,
  profitMargin,
}) {
  const { formatPrice } = useCurrency();

  const cards = [
    {
      title: 'Total Sales',
      value: formatPrice(totalSales),
      icon: DollarSign,
      color: 'emerald',
      subtitle: 'Revenue generated',
    },
    {
      title: 'Total Expenses',
      value: formatPrice(totalExpenses),
      icon: TrendingDown,
      color: 'red',
      subtitle: 'Operating costs',
    },
    {
      title: 'Outstanding Debts',
      value: formatPrice(totalDebts),
      icon: AlertCircle,
      color: 'amber',
      subtitle: 'Receivables',
    },
    {
      title: 'Inventory Value',
      value: formatPrice(totalInventoryCost),
      icon: Package,
      color: 'blue',
      subtitle: 'Stock on hand',
    },
    {
      title: 'Net Profit',
      value: formatPrice(totalProfit),
      icon: TrendingUp,
      color: totalProfit >= 0 ? 'indigo' : 'red',
      subtitle: 'After expenses',
    },
    {
      title: 'Profit Margin',
      value: `${profitMargin}%`,
      icon: Percent,
      color: 'purple',
      subtitle: 'Profitability ratio',
    },
  ];

  const colorMap = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            whileHover={{ y: -2 }}
            className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-4 sm:p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300"
          >
            <div className="flex flex-col gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm ${colorMap[card.color]}`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                  {card.title}
                </p>
                <div className="flex flex-col">
                    <p className="text-sm sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                      {card.value}
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 italic">
                        {card.subtitle}
                    </p>
                </div>
              </div>
            </div>
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 rounded-3xl bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl pointer-events-none"></div>
          </motion.div>
        );
      })}
    </div>
  );
}