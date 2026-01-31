import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

export default function LedgerStatsCards({ totals }) {
  const { formatPrice } = useCurrency();
  const netBalance = totals.totalDebit - totals.totalCredit;

  const cards = [
    {
      title: 'Money In (Debit)',
      value: formatPrice(totals.totalDebit),
      icon: TrendingUp,
      color: 'green',
      subtitle: 'Total inflow',
    },
    {
      title: 'Money Out (Credit)',
      value: formatPrice(totals.totalCredit),
      icon: TrendingDown,
      color: 'red',
      subtitle: 'Total outflow',
    },
    {
      title: 'Net Balance',
      value: formatPrice(netBalance),
      icon: DollarSign,
      color: netBalance >= 0 ? 'blue' : 'orange',
      subtitle: netBalance >= 0 ? 'Positive balance' : 'Negative balance',
    },
    {
      title: 'Transaction Activity',
      value: `${((totals.totalDebit / (totals.totalDebit + totals.totalCredit)) * 100 || 0).toFixed(1)}%`,
      icon: Activity,
      color: 'purple',
      subtitle: 'Inflow ratio',
    },
  ];

  const colorMap = {
    green: 'from-green-500 to-emerald-600',
    red: 'from-red-500 to-rose-600',
    blue: 'from-blue-500 to-indigo-600',
    orange: 'from-orange-500 to-amber-600',
    purple: 'from-purple-500 to-violet-600',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${colorMap[card.color]} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                {card.title}
              </h3>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white mb-1 truncate" title={String(card.value)}>
                {card.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {card.subtitle}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}