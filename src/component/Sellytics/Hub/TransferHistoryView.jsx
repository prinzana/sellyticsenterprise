// TransferHistoryView.jsx
import React from "react";
import { ArrowRight } from "lucide-react";

export default function TransferHistoryView({ transfers }) {
  return (
    <div className="bg-white dark:bg-surface-800 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/60">
      {/* Header */}
      <div className="p-2.5 sm:p-3 border-b border-slate-200 dark:border-slate-700/60">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Recent Transfers</h3>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3">
        {transfers.length === 0 ? (
          <div className="text-center py-8 sm:py-10 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            No transfers yet
          </div>
        ) : (
          <div className="space-y-1.5 sm:space-y-2">
            {transfers.map((t) => (
              <div key={t.id} className="p-2 sm:p-2.5 bg-slate-50 dark:bg-surface-900 rounded-lg border border-slate-200 dark:border-slate-700">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  {/* Left: Icon + Info */}
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="p-1 sm:p-1.5 bg-indigo-100 dark:bg-indigo-950/60 rounded flex-shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        → {t.destination_store?.shop_name}
                      </p>
                      <p className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {new Date(t.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric' 
                        })}
                        <span className="hidden sm:inline"> • <span className="italic">by {t.created_by || "Unknown"}</span></span>
                      </p>
                      {/* Mobile: Show creator on separate line */}
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 sm:hidden italic">
                        by {t.created_by || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Right: Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-medium flex-shrink-0 ${
                      t.status === "COMPLETED" 
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300" 
                        : "bg-slate-100 dark:bg-surface-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                {/* Product List - Compact */}
                {t.items?.length > 0 && (
                  <ul className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 space-y-0.5 text-[10px] sm:text-xs text-slate-600 dark:text-slate-300">
                    {t.items.map((it, idx) => (
                      <li key={idx} className="flex justify-between items-center gap-2">
                        <span className="truncate flex-1">
                          {it.product?.product_name || "Unknown Product"}
                        </span>
                        <span className="font-medium flex-shrink-0 text-slate-900 dark:text-white">
                          {it.quantity} pcs
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}