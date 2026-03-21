// src/components/Debts/DebtCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  User,
  Package,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { useCurrency } from '../../context/currencyContext'; // optional – remove if not needed

export default function DebtCard({
  debt,
  onViewDetail,
  onEdit,
  onDelete,
  permissions,

}) {
  const [showMenu, setShowMenu] = useState(false);
  const { preferredCurrency = { code: 'USD', symbol: '$' }, formatPrice } = useCurrency() || {};
  const menuRef = React.useRef(null);

  // Fix Framer Motion 'fixed' bug: Capture outside clicks cleanly without broken inset-0 overlays
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      // If menu is open and click was outside the menu container, close it
      if (showMenu && menuRef.current && !menuRef.current.contains(e.target)) {
         // Also check if we clicked on the trigger button itself, wait the button is inside menuRef or not? No, let's put it on the menu actions wrapper
         setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Safety: skip rendering if debt is invalid
  if (!debt || typeof debt !== 'object' || !debt.id) {
    return null;
  }

  const {
    canView = false,
    canEdit = false,
    canDelete = false,
  } = permissions || {};

  const hasAnyAction = canView || canEdit || canDelete;

  // Safe defaultsa
  const owed = debt.owed ?? 0;
  const deposited = debt.deposited ?? 0;
  const balance = owed - deposited;
  const isPaid = balance <= 0;
  const isPartial = deposited > 0 && balance > 0;
  const autoStatus = isPaid ? 'Paid' : isPartial ? 'Partial' : 'Unpaid';
  const displayStatus = debt.status || autoStatus;

  const customerName = debt.customer_name ?? 'Unknown Customer';
  const productName = debt.product_name ?? 'Unknown Product';
  const customerPhone = debt.customer_phone ?? 'N/A';
  const date = debt.date ? new Date(debt.date).toLocaleDateString() : 'N/A';
  const isReturned = !!debt.is_returned;

  const formatAmount = (amount) => {
    if (formatPrice) return formatPrice(amount);
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: preferredCurrency.code,
      }).format(amount);
    } catch {
      return `${preferredCurrency.symbol}${Number(amount).toFixed(2)}`;
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm(`Delete debt for ${customerName} (${productName})? This cannot be undone.`)) {
      onDelete?.(debt.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        relative p-3.5 sm:p-5
        bg-white dark:bg-slate-800
        rounded-none sm:rounded-2xl border-b border-x-0 sm:border border-slate-100 dark:border-slate-700 sm:border-slate-200
        transition-all duration-300 sm:hover:shadow-lg w-full
        ${canView ? 'cursor-pointer' : 'cursor-default'} ${showMenu ? 'z-50' : 'z-10'}
      `}
      onClick={canView ? () => onViewDetail?.(debt) : undefined}
    >
      <div className="flex items-center gap-3 sm:gap-5 pr-[2rem] sm:pr-[3rem]">
        {/* Left: Icon */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50 dark:bg-indigo-900/30">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Middle: Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 sm:gap-1">
           <div className="flex items-center justify-between gap-2 w-full">
             <div className="flex items-center gap-1.5 min-w-0">
               <h3 className="font-bold text-[13px] sm:text-lg text-slate-900 dark:text-white truncate">
                 {customerName}
               </h3>
               {/* Badge inline after name on desktop */}
               <span
                 className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex-shrink-0 border ${displayStatus === 'Paid'
                   ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
                   : displayStatus === 'Partial'
                     ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
                     : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                 }`}
               >
                 {displayStatus}
               </span>
             </div>
             <div className="flex flex-col items-end flex-shrink-0">
               <span className={`font-black text-[13px] sm:text-lg ${balance <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                 {formatAmount(Math.max(balance, 0))}
               </span>
               <span className="hidden sm:block text-[10px] text-slate-400 font-medium">Balance</span>
             </div>
           </div>
           
           <div className="flex items-center justify-between gap-2 w-full">
             <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 min-w-0">
               <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
               <span className="truncate flex-1">{productName}</span>
               <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
               <span className="hidden sm:inline font-medium">{customerPhone}</span>
             </div>
             
             {/* Badge on Mobile, Date on Desktop */}
             <div className="flex items-center gap-2 flex-shrink-0">
               <span
                 className={`sm:hidden inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${displayStatus === 'Paid'
                   ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
                   : displayStatus === 'Partial'
                     ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
                     : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                 }`}
               >
                 {displayStatus}
               </span>
               <div className="hidden sm:flex items-center gap-1.5 text-[11px] sm:text-sm text-slate-500 font-medium">
                 <Calendar className="w-4 h-4" />
                 <span>{date}</span>
               </div>
             </div>
           </div>
        </div>

        {/* Desktop Actions Area */}
        <div className="hidden sm:flex items-center gap-6 flex-shrink-0 ml-4">
          {isReturned && (
            <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 mt-1">
              <RotateCcw className="w-4 h-4" />
              <span>Returned</span>
            </div>
          )}
          {hasAnyAction && (
             <div className="relative">
               {/* Note: In Desktop we render the standard inline button; using same menu state handling for simplicity here */}
             </div>
          )}
        </div>
      </div>

      {hasAnyAction && (
        <div ref={menuRef} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[100]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>

          {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[100]"
              >
                {canView && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onViewDetail?.(debt);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-left"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                )}

                {canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onEdit?.(debt);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-left"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Debt
                  </button>
                )}

                {canDelete && (
                  <button
                    onClick={handleDeleteClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}