import React from 'react';
import { RotateCcw, X } from 'lucide-react';
import { CREATE_STATUS_OPTIONS } from './returnsConstants';
import LoadingSpinner from './LoadingSpinner';

export default function InitiateReturnForm({
  show,
  onClose,
  clients = [],
  getProductsForClient,
  initiateData,
  setInitiateData,
  processing,
  onSubmit,
}) {
  if (!show) return null;

  const clientProducts = getProductsForClient ? getProductsForClient(initiateData.clientId) || [] : [];
return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
    <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
      
      {/* Compact Header */}
      <div className="flex-shrink-0 px-3 py-2.5 sm:px-4 sm:py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Create Return Request</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4">
            {/* Client Select */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">
                Client <span className="text-rose-500">*</span>
              </label>
              <select
                value={initiateData.clientId}
                onChange={(e) =>
                  setInitiateData((prev) => ({
                    ...prev,
                    clientId: e.target.value,
                    productId: '',
                  }))
                }
                className="w-full px-3 py-2 sm:py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
              >
                <option value="">Select a client...</option>
                {clients.map((c) => {
                  const name = c.stores?.shop_name || c.external_name || `${c.client_name}`;
                  return (
                    <option key={c.id} value={c.id}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Product Select */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">
                Product <span className="text-rose-500">*</span>
              </label>
              <select
                value={initiateData.productId}
                onChange={(e) =>
                  setInitiateData((prev) => ({ ...prev, productId: e.target.value }))
                }
                disabled={!initiateData.clientId}
                className="w-full px-3 py-2 sm:py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-slate-600 disabled:bg-slate-50 disabled:dark:bg-slate-800/50 disabled:cursor-not-allowed disabled:hover:border-slate-300 transition-colors"
              >
                <option value="">
                  {initiateData.clientId ? 'Select a product...' : 'First select a client'}
                </option>
                {clientProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - SKU: {p.sku} ({p.available} available)
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={initiateData.quantity}
                onChange={(e) =>
                  setInitiateData((prev) => ({
                    ...prev,
                    quantity: Math.max(1, parseInt(e.target.value) || 1),
                  }))
                }
                className="w-full px-3 py-2 sm:py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
              />
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={initiateData.status || 'REQUESTED'}
                onChange={(e) =>
                  setInitiateData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-3 py-2 sm:py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
              >
                {CREATE_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column - Reason Textarea */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">
              Reason for Return <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={initiateData.reason}
              onChange={(e) =>
                setInitiateData((prev) => ({ ...prev, reason: e.target.value }))
              }
              rows={11}
              placeholder="e.g. Defective product, wrong item shipped, customer changed mind, damaged in transit..."
              className="w-full px-3 py-2 sm:py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:placeholder-slate-500 hover:border-slate-400 dark:hover:border-slate-600 resize-none transition-colors h-full"
            />
          </div>
        </div>
      </div>

      {/* Compact Footer */}
      <div className="flex-shrink-0 px-3 py-2.5 sm:px-4 sm:py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col-reverse sm:flex-row justify-end gap-2">
        <button
          onClick={onClose}
          disabled={processing}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-white dark:hover:bg-slate-800 active:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={
            processing || 
            !initiateData.clientId || 
            !initiateData.productId || 
            !initiateData.reason.trim()
          }
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          {processing ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Creating...</span>
            </>
          ) : (
            'Create Return Request'
          )}
        </button>
      </div>
    </div>
  </div>
);
}