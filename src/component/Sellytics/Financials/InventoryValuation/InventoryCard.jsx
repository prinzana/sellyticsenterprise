// components/inventory-valuation/InventoryCard.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Archive, Trash2 } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

export default function InventoryCard({ item, isSelected, onSelect, onDelete, onArchive }) {
  const { formatPrice } = useCurrency();
  const [menuOpen, setMenuOpen] = useState(false);

  const hasPrice = item.purchase_price && item.purchase_price > 0;
  const badgeClass = hasPrice
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';

  const totalValue = item.quantity * (item.purchase_price || 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`w-full bg-white dark:bg-slate-800 rounded-xl border transition-all duration-300 relative ${isSelected
          ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500/10'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
    >
      <div className="p-3 sm:p-4">
        {/* Top Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Left side: Checkbox + Name */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(item.id, e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer mt-0.5 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
                {item.product_name}
              </p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium ${badgeClass}`}>
                {hasPrice ? 'Priced' : 'No Price'}
              </span>
            </div>
          </div>

          {/* Right side: Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 z-20 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden origin-top-right"
                  >
                    <button
                      onClick={() => {
                        onArchive(item.id);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2.5 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left text-sm font-medium"
                    >
                      <Archive className="w-4 h-4" />
                      Archive Item
                    </button>
                    <button
                      onClick={() => {
                        onDelete(item.id);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2.5 flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Item
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
              Quantity
            </p>
            <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white truncate">
              {item.quantity.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
              Unit Cost
            </p>
            <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white truncate" title={hasPrice ? formatPrice(item.purchase_price) : '—'}>
              {hasPrice ? formatPrice(item.purchase_price) : '—'}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[10px] sm:text-xs font-medium text-indigo-500 dark:text-indigo-400">
              Total Value
            </p>
            <p className="text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-300 truncate" title={hasPrice ? formatPrice(totalValue) : '—'}>
              {hasPrice ? formatPrice(totalValue) : '—'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}