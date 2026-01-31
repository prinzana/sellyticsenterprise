/**
 * Return Stats Header Component
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, AlertCircle, TrendingDown } from 'lucide-react';
import ReasonsAnalysisModal from './ReasonsAnalysisModal';
import { useCurrency } from '../../context/currencyContext';

export default function ReturnStatsHeader({ stats }) {
  const { formatPrice } = useCurrency();
  const [showReasons, setShowReasons] = useState(false);

  const statCards = [
    {
      title: 'Total Returns',
      value: stats.totalReturns,
      icon: Package,
      color: 'indigo',
    },
    {
      title: 'Returns Value',
      value: formatPrice(stats.totalValue || 0),
      icon: DollarSign,
      color: 'emerald',
    },
    {
      title: 'Average Value',
      value: formatPrice(stats.averageValue || 0),
      icon: TrendingDown,
      color: 'amber',
    },
    {
      title: 'Top Reasons',
      value: stats.topReasons?.length || 0,
      icon: AlertCircle,
      color: 'red',
      clickable: true,
      onClick: () => setShowReasons(true),
    },
  ];

  const colorMap = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={stat.clickable ? stat.onClick : undefined}
            className={`bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 ${stat.clickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white truncate" title={String(stat.value)}>
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorMap[stat.color]}`}
              >
                <stat.icon className="w-7 h-7" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <ReasonsAnalysisModal
        isOpen={showReasons}
        onClose={() => setShowReasons(false)}
        reasons={stats.topReasons}
      />
    </>
  );
}
