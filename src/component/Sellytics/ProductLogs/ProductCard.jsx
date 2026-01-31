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
        relative w-full bg-white dark:bg-slate-800 
        rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700
        overflow-hidden transition-all duration-200
        ${canView ? 'cursor-pointer hover:shadow-md dark:hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 active:scale-95' : 'cursor-not-allowed opacity-60'}
      `}
    >
      {/* Pending Badge */}
      {isPending && (
        <div className="absolute top-2.5 right-2.5 z-20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-amber-500 text-white text-xs sm:text-xs font-semibold flex items-center gap-1 shadow-lg">
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span className="hidden xs:inline">Pending</span>
        </div>
      )}

      {/* Offline Indicator */}
      {isOffline && isPending && (
        <div className="absolute top-2.5 left-2.5 z-20 w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
          <WifiOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
        </div>
      )}

      {/* Main Content */}
      <div className="w-full p-2 sm:p-2.5 md:p-3">

        {/* Header Row: Icon + Title + Menu */}
        <div className="flex items-start gap-2 sm:gap-2.5 mb-2 sm:mb-2.5 min-w-0">
          {/* Product Icon */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:to-indigo-900/20 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Package className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400" />
          </div>

          {/* Title + Supplier */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white truncate pr-1">
              {product.name}
            </h3>
            {product.suppliers_name && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate line-clamp-1">
                {product.suppliers_name}
              </p>
            )}
          </div>

          {/* Menu Button */}
          {hasAnyAction && (
            <div className="relative flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu((prev) => !prev);
                }}
                className="w-8 h-8 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 active:scale-90 transition-all flex items-center justify-center flex-shrink-0"
              >
                <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                    className="absolute right-0 top-full mt-1 w-36 sm:w-40 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                  >
                    {canView && (
                      <button
                        onClick={(e) => handleAction(onView, e)}
                        className="w-full flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:bg-indigo-100 dark:active:bg-indigo-900/30 transition-all border-b border-slate-100 dark:border-slate-700 last:border-0"
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        <span>View</span>
                      </button>
                    )}

                    {canEdit && (
                      <button
                        onClick={(e) => handleAction(onEdit, e)}
                        className="w-full flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/30 transition-all border-b border-slate-100 dark:border-slate-700 last:border-0"
                      >
                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span>Edit</span>
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={canDeleteSafely ? handleDeleteClick : undefined}
                        disabled={!canDeleteSafely}
                        className={`
                          w-full flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all
                          ${canDeleteSafely
                            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30'
                            : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'}
                        `}
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>Delete</span>
                        {isOffline && !canDeleteSafely && (
                          <span className="ml-auto text-xs font-semibold opacity-70">Offline</span>
                        )}
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Price + Quantity Row */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
          {/* Selling Price */}
          {product.selling_price != null && (
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-50/50 dark:from-indigo-900/20 dark:to-indigo-900/10 rounded-lg bg-indigo-200/50 dark:bg-indigo-900/30 p-2 sm:p-2.5 border border-indigo-200/50 dark:border-indigo-800/50 min-w-0 overflow-hidden">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Price</p>
              <p className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate" title={formatPrice ? formatPrice(product.selling_price) : `$${Number(product.selling_price).toFixed(2)}`}>
                {formatPrice ? formatPrice(product.selling_price) : `$${Number(product.selling_price).toFixed(2)}`}
              </p>
            </div>
          )}

          {/* Quantity */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-lg bg-emerald-200/50 dark:bg-emerald-900/30 p-2 sm:p-2.5 border border-emerald-200/50 dark:border-emerald-800/50">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
              {product.is_unique ? 'Units' : 'Qty'}
            </p>
            <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {qty}
            </p>
          </div>
        </div>

        {/* Badges Row */}
        {product.is_unique && (
          <div className="mb-2 sm:mb-2.5">
            <span className="inline-flex px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
              ✓ Unique
            </span>
          </div>
        )}

        {/* Description (if exists) */}
        {product.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mb-2 sm:mb-2.5 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Footer: Meta Info */}
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-0.5 xs:gap-1 text-xs text-slate-500 dark:text-slate-400 pt-2 sm:pt-2.5 border-t border-slate-100 dark:border-slate-700/50">
          {product.created_at && (
            <span className="truncate text-xs">
              <span className="font-semibold">Added:</span> {new Date(product.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {product.updated_by_email && (
            <span className="truncate text-right xs:text-left text-xs">
              <span className="font-semibold">By:</span> {product.updated_by_email.split('@')[0]}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default ProductCard;