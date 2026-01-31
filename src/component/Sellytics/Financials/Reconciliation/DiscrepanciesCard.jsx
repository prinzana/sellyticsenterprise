import React from 'react';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '../../../context/currencyContext';

export default function DiscrepanciesCard({ totalDiscrepancy, discrepanciesByPaymentMethod }) {
  const { formatPrice } = useCurrency();

  // Create a unified list of cards
  const cards = [
    {
      title: 'Total Discrepancy',
      discrepancy: totalDiscrepancy,
    },
    ...Object.entries(discrepanciesByPaymentMethod).map(([method, discrepancy]) => ({
      title: method,
      discrepancy,
    })),
  ];

  const colorMap = {
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-600 dark:text-red-400',
    },
    emerald: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    slate: {
      bg: 'bg-slate-100 dark:bg-slate-700',
      text: 'text-slate-600 dark:text-slate-400',
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
      {cards.map((card, idx) => {
        const isShort = card.discrepancy > 0;
        const isOver = card.discrepancy < 0;

        const color = isShort ? 'red' : isOver ? 'emerald' : 'slate';
        const Icon = isShort ? TrendingDown : isOver ? TrendingUp : AlertCircle;

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-start gap-2 sm:gap-3 flex-col sm:flex-row">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${colorMap[color].bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colorMap[color].text}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-xs text-slate-500 leading-tight truncate">
                  {card.title}
                </p>
                <p className={`text-xs sm:text-sm font-bold ${colorMap[color].text} truncate`} title={formatPrice(Math.abs(card.discrepancy))}>
                  {formatPrice(Math.abs(card.discrepancy))}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}