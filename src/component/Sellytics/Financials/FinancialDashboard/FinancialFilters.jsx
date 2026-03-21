import React from 'react';
import { motion } from 'framer-motion';
import { Store, Calendar, Filter, TrendingUp, ChevronDown, Loader2 } from 'lucide-react';

export default function FinancialFilters({
  stores,
  storeId,
  setStoreId,
  timeFilter,
  setTimeFilter,
  timeGranularity,
  setTimeGranularity,
  metricFilter,
  setMetricFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onApply,
  isLoading,
}) {
  return (
    <div className="bg-white/50 dark:bg-slate-900/40 divide-y divide-slate-200/50 dark:divide-slate-800/50">
      <div className="p-3 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Store Selection */}
        <div className="relative group">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 px-1">
            <Store className="w-3 h-3 text-indigo-500" />
            Selected Store
          </label>
          <div className="relative">
            <select
                className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all font-bold text-xs appearance-none cursor-pointer shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600 disabled:opacity-50"
                value={storeId}
                onChange={(e) => {
                    setStoreId(e.target.value);
                    localStorage.setItem('store_id', e.target.value);
                }}
                disabled={isLoading}
            >
                <option value="">Choose a store...</option>
                {stores.map(store => (
                <option key={store.id} value={store.id}>{store.shop_name}</option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Time Horizon */}
        <div className="relative group">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 px-1">
            <Calendar className="w-3 h-3 text-purple-500" />
            Analysis Period
          </label>
          <div className="relative">
            <select
                className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all font-bold text-xs appearance-none cursor-pointer shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                disabled={isLoading}
            >
                <option value="30d">Last 30 Days</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
                <option value="custom">📅 Custom Range</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* View Granularity */}
        <div className="relative group">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 px-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            Data Precision
          </label>
          <div className="relative">
            <select
                className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all font-bold text-xs appearance-none cursor-pointer shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600"
                value={timeGranularity}
                onChange={(e) => setTimeGranularity(e.target.value)}
                disabled={isLoading}
            >
                <option value="daily">Daily View</option>
                <option value="weekly">Weekly View</option>
                <option value="monthly">Monthly View</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Primary Metric Filter */}
        <div className="relative group">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 px-1">
            <Filter className="w-3 h-3 text-amber-500" />
            Core Analytics
          </label>
          <div className="relative">
            <select
                className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all font-bold text-xs appearance-none cursor-pointer shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600"
                value={metricFilter}
                onChange={(e) => setMetricFilter(e.target.value)}
                disabled={isLoading}
            >
                <option value="All">All Intelligence</option>
                <option value="Sales">Revenue Streams</option>
                <option value="Expenses">Operational Costs</option>
                <option value="COGS">Inventory Expense</option>
                <option value="Debts">Unpaid Credits</option>
                <option value="Comparison">🏛️ Multi-Store Compare</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Dynamic Date Inputs */}
        {timeFilter === 'custom' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="col-span-1 sm:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 pt-4 border-t border-slate-200/50 dark:border-slate-800/50"
          >
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 px-1">
                Start Range
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all font-bold text-xs shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 px-1">
                End Range
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all font-bold text-xs shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="hidden sm:flex items-center gap-4 px-3">
             <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">System Online</span>
             </div>
        </div>
        <button
          onClick={onApply}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/20 group"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4 group-hover:translate-y-[-1px] transition-transform" />}
          Execute Analysis
        </button>
      </div>
    </div>
  );
}