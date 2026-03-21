// src/components/Debt/DebtListItem.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, DollarSign, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast'; // <-- Added import

function DebtActions({ debt, onRecordPayment, onViewHistory, onDelete, canDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete debt for ${debt.customer_name}? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setShowMenu(false);

    try {
      await onDelete(); // Parent handles actual Supabase delete + refresh
      // toast is generally triggered in parent, but safe here too
    } catch (error) {
      toast.error('Failed to delete debt');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-label="More actions"
        onClick={(e) => {
          e.stopPropagation();
          if (!deleting) setShowMenu((prev) => !prev);
        }}
        disabled={deleting}
        className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
      >
        <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
      </button>

      {showMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
        >
          {debt.status !== 'paid' && (
            <button
              onClick={() => {
                setShowMenu(false);
                onRecordPayment();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition"
            >
              <DollarSign className="w-4 h-4" /> Record Payment
            </button>
          )}

          <button
            onClick={() => {
              setShowMenu(false);
              onViewHistory();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition"
          >
            <Calendar className="w-4 h-4" /> View History
          </button>

          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left transition disabled:opacity-70"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete Debt'}
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function DebtListItem({
  debt,
  formatPrice,
  onRecordPayment,
  onViewHistory,
  onDelete, // Should return a Promise
  canDelete,
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative p-3.5 sm:p-5 bg-white dark:bg-slate-800 rounded-none sm:rounded-2xl border-b border-x-0 sm:border border-slate-100 dark:border-slate-700 sm:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300 w-full"
    >
      <div className="flex items-center gap-3 sm:gap-4 w-full">
        {/* Left: Icon */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50 dark:bg-indigo-900/30">
          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Middle: Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 sm:gap-1">
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-bold text-[13px] sm:text-lg text-slate-900 dark:text-white truncate">
                {debt.customer_name}
              </h3>
              {/* Desktop Status Badge */}
              <span className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-[10px] font-bold uppercase tracking-wider flex-shrink-0 border 
                ${debt.status === 'paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' 
                : debt.status === 'partial' ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400' 
                : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'}`}
              >
                {debt.status === 'paid' ? 'Paid' : debt.status === 'partial' ? 'Partial' : 'Owing'}
              </span>
            </div>
            {/* Desktop and Mobile Balance */}
            <div className="flex flex-col items-end flex-shrink-0">
              <span className={`font-black text-[13px] sm:text-lg ${debt.remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {formatPrice(debt.remaining)}
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide">Remaining</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 min-w-0">
            {/* Mobile Status Text */}
            <span className={`sm:hidden font-bold uppercase tracking-wider ${debt.status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : debt.status === 'partial' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {debt.status === 'paid' ? 'Paid' : debt.status === 'partial' ? 'Partial' : 'Owing'}
            </span>
            <span className="sm:hidden text-slate-300 dark:text-slate-600">•</span>
            {/* Payment history text */}
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate flex-1">
              {debt.payment_history?.length > 0
                ? new Date(debt.payment_history[0].payment_date).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'No payments'}
            </span>
          </div>
        </div>

        {/* Action Menu (Standard Flex flow) */}
        <div className="shrink-0 flex items-center justify-center">
          <DebtActions
            debt={debt}
            onRecordPayment={onRecordPayment}
            onViewHistory={onViewHistory}
            onDelete={onDelete}
            canDelete={canDelete}
          />
        </div>
      </div>
    </motion.div>
  );
}