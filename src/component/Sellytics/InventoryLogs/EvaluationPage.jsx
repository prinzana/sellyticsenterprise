
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, Package, TrendingUp, AlertTriangle,
  BarChart2, PieChart as PieChartIcon, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

import { useCurrency } from '../../context/currencyContext'; // Adjust path if needed

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function EvaluationPage({ inventory }) {
  // Use the currency formatter correctly from the hook
  const { formatPrice } = useCurrency();

  // Calculate all metrics
  const metrics = useMemo(() => {
    if (!inventory?.length) return null;

    let totalCostValue = 0;
    let totalRetailValue = 0;
    let totalUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const categoryData = {};

    inventory.forEach(item => {
      const product = item.dynamic_product;
      if (!product) return;

      const qty = item.available_qty || 0;
      const costPrice = product.purchase_price || 0;
      const sellPrice = product.selling_price || 0;

      totalUnits += qty;
      totalCostValue += qty * costPrice;
      totalRetailValue += qty * sellPrice;

      if (qty === 0) outOfStockCount++;
      else if (qty <= 5) lowStockCount++;

      const category = product.category || 'Uncategorized';
      if (!categoryData[category]) {
        categoryData[category] = { name: category, value: 0, units: 0 };
      }
      categoryData[category].value += qty * costPrice;
      categoryData[category].units += qty;
    });

    const potentialProfit = totalRetailValue - totalCostValue;
    const profitMargin = totalRetailValue > 0 ? (potentialProfit / totalRetailValue) * 100 : 0;

    return {
      totalCostValue,
      totalRetailValue,
      potentialProfit,
      profitMargin,
      totalUnits,
      totalProducts: inventory.length,
      lowStockCount,
      outOfStockCount,
      categoryData: Object.values(categoryData).sort((a, b) => b.value - a.value),
    };
  }, [inventory]);

  // Top 10 products by inventory value
  const topProducts = useMemo(() => {
    if (!inventory?.length) return [];

    return inventory
      .map(item => ({
        name: item.dynamic_product?.name || 'Unknown',
        value: (item.available_qty || 0) * (item.dynamic_product?.purchase_price || 0),
        qty: item.available_qty || 0,
      }))
      .filter(p => p.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [inventory]);

  if (!metrics) {
    return (
      <div className="text-center py-8 sm:py-12 text-slate-500 px-3 sm:px-4 md:px-6">
        <Package className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 opacity-50" />
        <p className="text-xs sm:text-sm">No inventory data</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Summary Cards - Compact on Mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 px-3 sm:px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-start gap-2 sm:gap-3 flex-col sm:flex-row">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-xs text-slate-500 leading-tight">Cost</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate" title={formatPrice(metrics.totalCostValue)}>
                {formatPrice(metrics.totalCostValue)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-start gap-2 sm:gap-3 flex-col sm:flex-row">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-xs text-slate-500 leading-tight">Retail</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate" title={formatPrice(metrics.totalRetailValue)}>
                {formatPrice(metrics.totalRetailValue)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-start gap-2 sm:gap-3 flex-col sm:flex-row">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-xs text-slate-500 leading-tight">Units</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {metrics.totalUnits.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-start gap-2 sm:gap-3 flex-col sm:flex-row">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${metrics.profitMargin >= 30
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : metrics.profitMargin >= 15
                  ? 'bg-amber-100 dark:bg-amber-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
              {metrics.profitMargin >= 20 ? (
                <ArrowUp className={`w-4 h-4 sm:w-5 sm:h-5 ${metrics.profitMargin >= 30 ? 'text-emerald-600' : 'text-amber-600'}`} />
              ) : (
                <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-xs text-slate-500 leading-tight">Margin</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {metrics.profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stock Alerts */}
      {(metrics.lowStockCount > 0 || metrics.outOfStockCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 px-3 sm:px-4 md:px-6">
          {metrics.outOfStockCount > 0 && (
            <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-xs sm:text-sm text-red-700 dark:text-red-300 truncate">
                  {metrics.outOfStockCount} out of stock
                </p>
                <p className="text-[9px] sm:text-xs text-red-600 dark:text-red-400">Restock now</p>
              </div>
            </div>
          )}
          {metrics.lowStockCount > 0 && (
            <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-xs sm:text-sm text-amber-700 dark:text-amber-300 truncate">
                  {metrics.lowStockCount} low stock
                </p>
                <p className="text-[9px] sm:text-xs text-amber-600 dark:text-amber-400">Soon</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts - Stacked on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 px-3 sm:px-4 md:px-6">
        {/* Top Products by Value */}
        <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
            <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">Top Products</h3>
          </div>
          <div className="h-48 sm:h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}
                  tick={{ fontSize: 11 }}
                />
                <YAxis type="category" dataKey="name" width={55} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value) => formatPrice(value)}
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
            <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">By Category</h3>
          </div>
          <div className="h-48 sm:h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {metrics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatPrice(value)}
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
            {metrics.categoryData.slice(0, 6).map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-1 text-[9px] sm:text-xs">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Potential Profit Highlight */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white mx-3 sm:mx-4 md:mx-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-indigo-100 text-[9px] sm:text-xs">Potential Profit</p>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold mt-1 truncate" title={formatPrice(metrics.potentialProfit)}>{formatPrice(metrics.potentialProfit)}</p>
            <p className="text-[9px] sm:text-xs text-indigo-200 mt-1 sm:mt-2 leading-tight">
              {metrics.totalUnits.toLocaleString()} units @ retail
            </p>
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}