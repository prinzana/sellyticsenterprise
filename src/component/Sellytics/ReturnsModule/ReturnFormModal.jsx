/**
 * Return Form Modal Component - Fixed Footer Visibility
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Package,
  DollarSign,
  ReceiptText,
} from 'lucide-react';
import { useCurrency } from '../../context/currencyContext';

export default function ReturnFormModal({
  isOpen,
  onClose,
  items,
  onSubmit,
}) {
  const { formatPrice } = useCurrency();
  const [formData, setFormData] = useState([]);

  useEffect(() => {
    if (items?.length) {
      setFormData(
        items.map((item) => ({
          id: item.id,
          receipt_id: item.receipt_id,
          receipt_code: item.receipt_code,
          customer_address: item.customer_address || '',
          product_name: item.product_name,
          device_id: item.device_id || '',
          qty: item.quantity,
          amount: item.amount,
          remark: '',
          status: 'Pending',
          returned_date: new Date().toISOString().split('T')[0],
        }))
      );
    }
  }, [items]);

  const updateItem = (index, field, value) => {
    setFormData((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] max-h-[90vh] flex flex-col" // Key: flex column + fixed height
        >
          {/* HEADER - Fixed */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Process Return{formData.length > 1 ? 's' : ''}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formData.length} item{formData.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* CONTENT - Scrollable */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1"> {/* flex-1 makes it take remaining space */}
            {formData.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-6"
              >
                {/* SUMMARY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-sm font-medium">Amount</span>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-300 truncate" title={formatPrice(item.amount)}>
                      {formatPrice(item.amount)}
                    </p>
                  </div>

                  <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 border">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                      <ReceiptText className="w-5 h-5" />
                      <span className="text-sm font-medium">Receipt</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {item.receipt_code}
                    </p>
                  </div>
                </div>

                {/* PRODUCT */}
                <div>
                  <p className="text-sm text-slate-500 mb-1">Product</p>
                  <p className="text-lg font-semibold">
                    {item.product_name}
                  </p>
                </div>

                {/* FORM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Status *
                    </label>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        updateItem(idx, 'status', e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Return Date *
                    </label>
                    <input
                      type="date"
                      value={item.returned_date}
                      onChange={(e) =>
                        updateItem(idx, 'returned_date', e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">
                      Reason / Remark *
                    </label>
                    <textarea
                      rows="4"
                      value={item.remark}
                      onChange={(e) =>
                        updateItem(idx, 'remark', e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER - Fixed at bottom */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3 justify-end flex-shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
            >
              <Save className="w-5 h-5" />
              Save Return{formData.length > 1 ? 's' : ''}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}