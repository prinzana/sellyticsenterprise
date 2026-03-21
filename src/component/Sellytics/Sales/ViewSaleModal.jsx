/**
 * SwiftCheckout - View Sale Modal
 * Shows detailed sale information
 * @version 1.0.0
 */
import React from 'react';
import { 
  X, Package, Calendar, CreditCard, User, Hash,
  Receipt, Clock, Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function ViewSaleModal({ sale, onClose, formatPrice }) {
  if (!sale) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy h:mm a');
    } catch {
      return dateStr;
    }
  };

  const deviceIds = sale.device_id?.split(',').filter(Boolean) || sale.deviceIds || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center flex-shrink-0">
                <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  Sale Details
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                  #{sale.id || 'Pending'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 w-full">
            
            {/* Product Info Block */}
            <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 flex flex-col items-center justify-center">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                  <h3 className="font-bold text-[13px] sm:text-base text-slate-900 dark:text-white truncate">
                    {sale.product_name || 'Product'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Qty: {sale.quantity}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="truncate">@ {formatPrice(sale.unit_price)}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-1 sm:pl-2">
                  <p className="text-sm sm:text-lg lg:text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {formatPrice(sale.amount || (sale.quantity * sale.unit_price))}
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Net Total
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* Date */}
              <div className="p-2 sm:p-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center gap-2.5">
                 <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                   <Calendar className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                 </div>
                 <div className="min-w-0 flex-1">
                   <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-0.5">Date</p>
                   <p className="text-[11px] sm:text-sm font-semibold text-slate-900 dark:text-white truncate" title={formatDate(sale.sold_at)}>
                      {formatDate(sale.sold_at)}
                   </p>
                 </div>
              </div>

              {/* Payment Method */}
              <div className="p-2 sm:p-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center gap-2.5">
                 <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                   <CreditCard className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                 </div>
                 <div className="min-w-0 flex-1">
                   <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-0.5">Payment</p>
                   <p className="text-[11px] sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {sale.payment_method || 'Cash'}
                   </p>
                 </div>
              </div>

              {/* Customer */}
              <div className="p-2 sm:p-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center gap-2.5">
                 <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                   <User className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                 </div>
                 <div className="min-w-0 flex-1">
                   <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-0.5">Customer</p>
                   <p className="text-[11px] sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {sale.customer_name || 'Walk-in'}
                   </p>
                 </div>
              </div>

              {/* Status */}
              <div className="p-2 sm:p-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center gap-2.5">
                 <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                   <Clock className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                 </div>
                 <div className="min-w-0 flex-1">
                   <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-0.5">Status</p>
                   <p className={`text-[11px] sm:text-sm font-semibold truncate ${
                     sale.status === 'sold' 
                       ? 'text-emerald-600 dark:text-emerald-400' 
                       : 'text-amber-600 dark:text-amber-400'
                   }`}>
                      {sale.status || 'Sold'}
                   </p>
                 </div>
              </div>
            </div>

            {/* Device IDs area */}
            {deviceIds.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/60">
                  <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 dark:text-indigo-400" />
                  <h4 className="font-bold text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Associated Device IDs
                  </h4>
                </div>
                <div className="p-2 sm:p-3 space-y-1.5 max-h-48 overflow-y-auto w-full">
                  {deviceIds.map((id, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700/50"
                    >
                      <span className="font-mono text-[11px] sm:text-sm font-semibold text-slate-800 dark:text-slate-300">
                        {id.trim()}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Info */}
            {sale.created_by_email && (
              <div className="flex w-full items-center gap-3 p-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Store className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-0.5">Processed By</p>
                  <p className="text-[11px] sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {sale.created_by_email}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 w-full z-10">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm sm:text-base hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
            >
              Close Details
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}