// src/components/Suppliers/SuppliersFilters.jsx
import React from 'react';
//import { FaFilter } from 'react-icons/fa';

export default function SuppliersFilters({
  showFilters,
 //setShowFilters,
  filters,
  setFilter,
  suppliers,
  clearFilters,
}) {
  return (
    <div className="mb-6">
      
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 sm:rounded-2xl p-4 sm:p-6 border-y sm:border border-slate-200 dark:border-slate-700 shadow-sm -mx-4 sm:mx-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[13px] sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Supplier</label>
              <select
                value={filters.supplier_name}
                onChange={(e) => setFilter('supplier_name', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-[13px] sm:text-sm font-medium"
              >
                {suppliers.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Device Name</label>
              <input
                type="text"
                value={filters.device_name}
                onChange={(e) => setFilter('device_name', e.target.value)}
                placeholder="Filter by name..."
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-[13px] sm:text-sm font-medium placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-[13px] sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Min Quantity</label>
              <input
                type="number"
                min="0"
                value={filters.qty_min}
                onChange={(e) => setFilter('qty_min', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-[13px] sm:text-sm font-medium placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-[13px] sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Max Quantity</label>
              <input
                type="number"
                min="0"
                value={filters.qty_max}
                onChange={(e) => setFilter('qty_max', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-[13px] sm:text-sm font-medium placeholder-slate-400"
              />
            </div>
          </div>
          <div className="mt-5 sm:mt-6 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white text-[13px] sm:text-sm font-bold rounded-xl transition shadow-md active:scale-95"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}