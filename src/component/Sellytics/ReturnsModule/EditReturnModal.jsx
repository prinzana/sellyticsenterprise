/**
 * Edit Return Modal Component - FIXED: Footer buttons always visible
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Package, DollarSign, ReceiptText } from 'lucide-react';
import { useCurrency } from '../../context/currencyContext';

export default function EditReturnModal({
  isOpen,
  onClose,
  returnItem,
  onSubmit,
}) {
  const { formatPrice } = useCurrency();

  const [formData, setFormData] = useState({
    remark: '',
    status: 'Pending',
    returned_date: '',
  });

  useEffect(() => {
    if (returnItem) {
      setFormData({
        remark: returnItem.remark || '',
        status: returnItem.status || 'Pending',
        returned_date:
          returnItem.returned_date ||
          new Date().toISOString().split('T')[0],
      });
    }
  }, [returnItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(returnItem.id, formData);
    onClose();
  };

  if (!isOpen || !returnItem) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] max-h-[90vh] flex flex-col overflow-hidden" // Key: flex column + fixed height
        >
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Edit Return
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Update return information
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-sm font-medium">Amount</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-300 truncate" title={formatPrice(returnItem.amount || 0)}>
                    {formatPrice(returnItem.amount || 0)}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                    <ReceiptText className="w-5 h-5" />
                    <span className="text-sm font-medium">Receipt</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                    {returnItem.receipt_code}
                  </p>
                </div>
              </div>

              {/* Product */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 mb-1">Product</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {returnItem.product_name}
                </p>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Return Date *
                  </label>
                  <input
                    type="date"
                    value={formData.returned_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        returned_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reason / Remark *
                  </label>
                  <textarea
                    rows="4"
                    value={formData.remark}
                    onChange={(e) =>
                      setFormData({ ...formData, remark: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Footer - Always Visible */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex gap-3 justify-end flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}