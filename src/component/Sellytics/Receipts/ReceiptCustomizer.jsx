/**
 * Receipt Customizer Component - Matches your modal style guide
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, RotateCcw } from 'lucide-react';

export default function ReceiptCustomizer({ styles, onUpdate, onReset, currentPlan, onLock }) {
  const [isOpen, setIsOpen] = useState(false);

  const colorOptions = [
    { label: 'Header Background', key: 'headerBgColor' },
    { label: 'Header Text Color', key: 'headerTextColor' },
    { label: 'Accent Color', key: 'accentColor' },
    { label: 'Border Color', key: 'borderColor' }
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => {
          if (currentPlan === 'FREE') {
            onLock('feature_locked');
          } else {
            setIsOpen(true);
          }
        }}
        className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all shadow-sm"
      >
        <Palette className="w-5 h-5" />
        Customize Receipt
        {currentPlan === 'FREE' && (
          <div className="bg-white/20 p-1 rounded-md">
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md h-[90vh] max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="h-full flex flex-col">
                {/* Header - Fixed */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Customize Receipt
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Adjust colors for your printed receipts
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="space-y-6">
                    {colorOptions.map(({ label, key }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                          {label}
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="color"
                            value={styles[key] || '#000000'}
                            onChange={(e) => onUpdate(key, e.target.value)}
                            className="w-20 h-12 rounded-lg border-2 border-slate-300 dark:border-slate-600 cursor-pointer hover:border-indigo-500 transition-all"
                          />
                          <input
                            type="text"
                            value={styles[key] || ''}
                            onChange={(e) => onUpdate(key, e.target.value)}
                            placeholder="#000000"
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer - Always Visible */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex gap-3 justify-between flex-shrink-0">
                  <button
                    type="button"
                    onClick={onReset}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset to Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}