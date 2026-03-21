/**
 * ProductCard Component - FIXED UNIQUE ITEM QTY DISPLAY
 * Now correctly shows quantity for unique items even if deviceList is missing
 */
import React, { useState, forwardRef, useMemo } from 'react';
import {
  Package,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Clock,
  WifiOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '../../context/currencyContext';

const ProductCard = forwardRef(function ProductCard(
  {
    product,
    index,
    onView,
    onEdit,
    onDelete,
    isOffline,
    isPending,
    permissions,

  },
  ref
) {
  const [showMenu, setShowMenu] = useState(false);
  const { preferredCurrency } = useCurrency();



  const formatPrice = (price) => {
    if (!price && price !== 0) return 'N/A';

    try {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: preferredCurrency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return formatter.format(price);
    } catch (err) {
      // Fallback
      return `${preferredCurrency.symbol} ${price}`;
    }
  };









  const {
    canView = false,
    canEdit = false,
    canDelete = false,
  } = permissions || {};

  const hasAnyAction = canView || canEdit || canDelete;

  // FIXED: Robust quantity calculation for unique items
  const qty = useMemo(() => {
    if (!product.is_unique) {
      return product.purchase_qty || 0;
    }

    // Priority 1: Use pre-formatted deviceList (best case)
    if (product.deviceList && Array.isArray(product.deviceList)) {
      return product.deviceList.length;
    }

    // Priority 2: Fallback to parsing dynamic_product_imeis string
    if (product.dynamic_product_imeis) {
      const imeis = product.dynamic_product_imeis
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      return imeis.length;
    }

    // Final fallback
    return 0;
  }, [product]);

  const handleAction = (action, e) => {
    e.stopPropagation();
    setShowMenu(false);
    action?.();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      onDelete?.();
    }
  };

  const canDeleteSafely = canDelete && !isOffline;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.02 }}
      onClick={canView ? onView : undefined}
      className={`
        relative w-full bg-white dark:bg-slate-900 
        rounded-none sm:rounded-xl border-y sm:border border-slate-200 dark:border-slate-800
        transition-all duration-200 
        ${canView ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 active:scale-[0.99] sm:active:scale-[0.99] active:scale-100' : 'cursor-not-allowed opacity-60'}
      `}
    >
      {/* Pending Badge */}
      {isPending && (
        <div className="absolute top-0 right-0 z-20 px-2 py-0.5 rounded-bl-lg rounded-tr-xl bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>Pending</span>
        </div>
      )}

      {/* Offline Indicator */}
      {isOffline && isPending && (
        <div className="absolute top-0 left-0 z-20 w-6 h-6 rounded-br-lg rounded-tl-xl bg-amber-500 flex items-center justify-center">
          <WifiOff className="w-3 h-3 text-white" />
        </div>
      )}

      <div className="w-full p-3 sm:p-4 flex flex-col">
        {/* Main Row: Icon, Text, Stats, Actions */}
        <div className="flex items-center gap-3 w-full">
          {/* Icon */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 dark:text-indigo-400" />
          </div>

          {/* Info: Title */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 pr-2">
             <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate" title={product.name}>
               {product.name}
             </h3>
             {product.is_unique && (
               <div className="flex">
                 <span className="flex-shrink-0 inline-flex px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold uppercase border border-indigo-200 dark:border-indigo-700/50 tracking-wider">
                   Unique
                 </span>
               </div>
             )}
          </div>

          {/* Stats: Price & Qty */}
          <div className="flex flex-col items-end justify-center flex-shrink-0 pr-1 max-w-[40%]">
             <p className="font-bold text-[12px] sm:text-base tracking-tighter sm:tracking-normal text-slate-900 dark:text-white truncate w-full text-right" title={product.selling_price != null ? String(product.selling_price) : ''}>
               {product.selling_price != null ? (formatPrice ? formatPrice(product.selling_price) : `$${Number(product.selling_price).toFixed(2)}`) : 'N/A'}
             </p>
             <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
               {product.is_unique ? 'Units:' : 'Qty:'} <span className="font-semibold text-slate-700 dark:text-slate-300">{qty}</span>
             </p>
          </div>

          {/* Actions */}
          {hasAnyAction && (
            <div className="relative flex-shrink-0 ml-1 border-l pl-2 sm:pl-3 border-slate-100 dark:border-slate-800">
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   setShowMenu((prev) => !prev);
                 }}
                 className="w-8 h-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
               >
                 <MoreVertical className="w-4 h-4" />
               </button>

               {showMenu && (
                 <>
                   <div
                     className="fixed inset-0 z-40"
                     onClick={(e) => {
                       e.stopPropagation();
                       setShowMenu(false);
                     }}
                   />
                   <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: -10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     className="absolute right-0 top-full mt-1 w-36 sm:w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                   >
                     {canView && (
                       <button
                         onClick={(e) => handleAction(onView, e)}
                         className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                       >
                         <Eye className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                         <span>View</span>
                       </button>
                     )}
                     {canEdit && (
                       <button
                         onClick={(e) => handleAction(onEdit, e)}
                         className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                       >
                         <Edit className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                         <span>Edit</span>
                       </button>
                     )}
                     {canDelete && (
                       <button
                         onClick={canDeleteSafely ? handleDeleteClick : undefined}
                         disabled={!canDeleteSafely}
                         className={`w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                           canDeleteSafely
                             ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                             : 'text-slate-400 cursor-not-allowed'
                         }`}
                       >
                         <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
                         <span>Delete</span>
                       </button>
                     )}
                   </motion.div>
                 </>
               )}
            </div>
          )}
        </div>

        {/* Footer Meta Row (Optional descriptions / dates) */}
        {(product.description || product.created_at || product.updated_by_email) && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
             {product.description && (
               <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                 {product.description}
               </p>
             )}
             <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                {product.created_at && (
                  <span>Added: {new Date(product.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                )}
                {product.updated_by_email && (
                  <span>By: {product.updated_by_email.split('@')[0]}</span>
                )}
             </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default ProductCard;