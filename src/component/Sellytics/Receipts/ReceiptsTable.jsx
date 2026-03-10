import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit,
  QrCode,
  Download,
  Trash2,
  Table,
  LayoutGrid,
  Printer
} from 'lucide-react';

const VIEW_MODES = {
  TABLE: 'table',
  CARD: 'card'
};

const VIEW_PREFERENCE_KEY = 'receipts_view_mode';

export default function ReceiptsList({
  receipts,
  onEdit,
  onViewQRCode,
  onDownloadPDF,
  onDelete,
  canDelete,
  currentPlan,
  onLock
}) {
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem(VIEW_PREFERENCE_KEY);
    return saved === VIEW_MODES.CARD ? VIEW_MODES.CARD : VIEW_MODES.TABLE;
  });

  // Load view mode preference
  useEffect(() => {
    localStorage.setItem(VIEW_PREFERENCE_KEY, viewMode);
  }, [viewMode]);

  const toggleView = () => {
    setViewMode(prev => prev === VIEW_MODES.TABLE ? VIEW_MODES.CARD : VIEW_MODES.TABLE);
  };

  const handlePrint = (receipt) => {
    // Simple print: opens browser print dialog focused on receipt content
    window.print();
  };

  if (receipts.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-lg bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        No receipts found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex justify-end">
        <button
          onClick={toggleView}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-sm font-medium shadow-sm"
        >
          {viewMode === VIEW_MODES.TABLE ? (
            <>
              <LayoutGrid className="w-4 h-4" />
              Card View
            </>
          ) : (
            <>
              <Table className="w-4 h-4" />
              Table View
            </>
          )}
        </button>
      </div>

      {/* Table View */}
      {viewMode === VIEW_MODES.TABLE && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 z-10">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Receipt ID</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Sale Group</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Customer</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Phone</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Warranty</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                <th className="text-center px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {receipts.map((receipt, idx) => (
                  <motion.tr
                    key={receipt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td
                      className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 font-medium cursor-pointer hover:text-indigo-600 transition-colors"
                      onClick={() => onViewQRCode(receipt)}
                    >
                      {receipt.receipt_id}
                    </td>
                    <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                      #{receipt.sale_group_id || '-'}
                    </td>
                    <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                      {receipt.customer_name || '-'}
                    </td>
                    <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                      {receipt.phone_number || '-'}
                    </td>
                    <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                      {receipt.warranty || '-'}
                    </td>
                    <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                      {new Date(receipt.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentPlan === 'FREE') onLock('feature_locked');
                            else onEdit(receipt);
                          }}
                          className={`p-2 rounded-lg transition-colors ${currentPlan === 'FREE' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'}`}
                          title={currentPlan === 'FREE' ? 'Upgrade to Edit' : 'Edit'}
                        >
                          {currentPlan === 'FREE' ? (
                            <div className="relative">
                              <Edit className="w-3.5 h-3.5 opacity-50" />
                              <div className="absolute -top-1 -right-1">
                                <svg className="w-2 h-2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                              </div>
                            </div>
                          ) : <Edit className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); onViewQRCode(receipt); }}
                          className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          title="View Details"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentPlan === 'FREE') onLock('feature_locked');
                            else onDownloadPDF(receipt);
                          }}
                          className={`p-2 rounded-lg transition-colors ${currentPlan === 'FREE' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'}`}
                          title={currentPlan === 'FREE' ? 'Upgrade to Download PDF' : 'Download PDF'}
                        >
                          {currentPlan === 'FREE' ? (
                            <div className="relative">
                              <Download className="w-3.5 h-3.5 opacity-50" />
                              <div className="absolute -top-1 -right-1">
                                <svg className="w-2 h-2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                              </div>
                            </div>
                          ) : <Download className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); handlePrint(receipt); }}
                          className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          title="Print Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {canDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentPlan === 'FREE') {
                                onLock('feature_locked');
                                return;
                              }
                              if (window.confirm('Delete this receipt and entire sale?')) {
                                onDelete(receipt.id);
                              }
                            }}
                            className={`p-2 rounded-lg transition-colors ${currentPlan === 'FREE' ? 'bg-slate-100 text-slate-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'}`}
                            title={currentPlan === 'FREE' ? 'Upgrade to Delete' : 'Delete'}
                          >
                            {currentPlan === 'FREE' ? (
                              <div className="relative">
                                <Trash2 className="w-3.5 h-3.5 opacity-50" />
                                <div className="absolute -top-1 -right-1">
                                  <svg className="w-2 h-2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                  </svg>
                                </div>
                              </div>
                            ) : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Card View */}
      {viewMode === VIEW_MODES.CARD && (
        <div className="space-y-2 sm:space-y-3">
          <AnimatePresence>
            {receipts.map((receipt, index) => (
              <motion.div
                key={receipt.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onViewQRCode(receipt)}
                className="relative p-2.5 sm:p-3 w-full bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer hover:shadow-lg"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  {/* Icon - Smaller on mobile */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30">
                    <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Top Row: Receipt ID + Action Buttons */}
                    <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {receipt.receipt_id}
                      </h3>

                      {/* Compact Action Buttons */}
                      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentPlan === 'FREE') onLock('feature_locked');
                            else onEdit(receipt);
                          }}
                          className={`p-1 sm:p-1.5 rounded transition-colors ${currentPlan === 'FREE' ? 'text-slate-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                          title={currentPlan === 'FREE' ? 'Upgrade to Edit' : 'Edit'}
                        >
                          <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); onViewQRCode(receipt); }}
                          className="p-1 sm:p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="View"
                        >
                          <QrCode className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-600 dark:text-slate-400" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentPlan === 'FREE') onLock('feature_locked');
                            else onDownloadPDF(receipt);
                          }}
                          className={`p-1 sm:p-1.5 rounded transition-colors ${currentPlan === 'FREE' ? 'text-slate-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                          title={currentPlan === 'FREE' ? 'Upgrade to PDF' : 'PDF'}
                        >
                          <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); handlePrint(receipt); }}
                          className="p-1 sm:p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Print"
                        >
                          <Printer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-600 dark:text-slate-400" />
                        </button>

                        {canDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentPlan === 'FREE') {
                                onLock('feature_locked');
                                return;
                              }
                              if (window.confirm('Delete this receipt?')) {
                                onDelete(receipt.id);
                              }
                            }}
                            className={`p-1 sm:p-1.5 rounded transition-colors ${currentPlan === 'FREE' ? 'text-slate-300' : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600'}`}
                            title={currentPlan === 'FREE' ? 'Upgrade to Delete' : 'Delete'}
                          >
                            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Details Grid - Super Compact */}
                    <div className="space-y-0.5 sm:space-y-1">
                      {receipt.customer_name && (
                        <div className="flex items-start gap-1 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">Customer:</span>
                          <span className="truncate">{receipt.customer_name}</span>
                        </div>
                      )}

                      {receipt.phone_number && (
                        <div className="flex items-start gap-1 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">Phone:</span>
                          <span className="truncate">{receipt.phone_number}</span>
                        </div>
                      )}

                      {receipt.warranty && (
                        <div className="flex items-start gap-1 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">Warranty:</span>
                          <span className="truncate">{receipt.warranty}</span>
                        </div>
                      )}
                    </div>

                    {/* Date - Compact */}
                    <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400">
                        {new Date(receipt.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}