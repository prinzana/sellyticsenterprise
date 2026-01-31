// components/inventory-valuation/InventoryStatsCards.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext'; // Your existing context

export default function InventoryStatsCards({ items }) {
  const { formatPrice } = useCurrency();

  const totalValue = items.reduce((sum, i) => sum + (i.quantity * (i.purchase_price || 0)), 0);
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const missingPriceCount = items.filter(i => !i.purchase_price || i.purchase_price <= 0).length;

  const cards = [
    { title: 'Total Stock Value', value: formatPrice(totalValue), icon: DollarSign, color: 'indigo' },
    { title: 'Total Products', value: totalItems, icon: Package, color: 'blue' },
    { title: 'Total Quantity', value: totalQuantity.toLocaleString(), icon: TrendingUp, color: 'green' },
    { title: 'Missing Prices', value: missingPriceCount, icon: AlertCircle, color: missingPriceCount > 0 ? 'red' : 'green' },
  ];

  const colorMap = {
    indigo: 'from-indigo-500 to-indigo-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    red: 'from-red-500 to-rose-600',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${colorMap[card.color]} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{card.title}</h3>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white truncate" title={String(card.value)}>{card.value}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}