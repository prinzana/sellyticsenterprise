import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, CreditCard, Receipt } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

export default function SalesStatsCards({ totalSalesAmount, salesByPaymentMethod, sales, selectedPaymentMethod }) {
  const { formatPrice } = useCurrency();

  const totalTransactions = sales.length;
  const uniqueMethods = Object.keys(salesByPaymentMethod).length;
  const avgTransaction = totalTransactions > 0 ? totalSalesAmount / totalTransactions : 0;

  const cards = [
    {
      title: 'Total Sales',
      value: formatPrice(totalSalesAmount),
      icon: DollarSign,
      color: 'indigo',
    },
    {
      title: 'Payment Methods',
      value: uniqueMethods,
      icon: CreditCard,
      color: 'blue',
    },
    {
      title: 'Average Sale',
      value: formatPrice(avgTransaction),
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      title: 'Filter Active',
      value: selectedPaymentMethod || 'All',
      icon: Receipt,
      color: 'purple',
    },
  ];

  const colorMap = {
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      text: 'text-indigo-600 dark:text-indigo-400',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
    },
    emerald: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
    },
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-start gap-2 sm:gap-3 flex-col sm:flex-row">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${colorMap[card.color].bg} flex items-center justify-center flex-shrink-0`}>
              <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colorMap[card.color].text}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-xs text-slate-500 leading-tight">
                {card.title}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate" title={String(card.value)}>
                {card.value}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}