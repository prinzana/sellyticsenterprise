import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, BarChart2, ChevronRight, Box } from 'lucide-react';
import useCurrency from './hooks/useCurrency'; // Adjust path if needed

const InventoryCard = forwardRef(({
  item,
  lowStockThreshold = 5,
  onClick,
  soldImeis = new Set()
}, ref) => {
  const { formatPrice } = useCurrency(); // Dynamic currency formatter

  const product = item?.dynamic_product;
  if (!product) return null;

  const isUnique = product.is_unique;

  // Get all IMEIs for unique products
  const imeis = isUnique && product.dynamic_product_imeis
    ? product.dynamic_product_imeis.split(',').map(i => i.trim()).filter(Boolean)
    : [];
  const totalImeis = imeis.length;

  // Calculate actual sold count from soldImeis set instead of stale item.quantity_sold
  const actualSoldCount = isUnique
    ? imeis.filter(imei => soldImeis.has(imei)).length
    : (item.quantity_sold || 0);

  // Calculate available count for unique products
  const imeiCount = Math.max(0, totalImeis - actualSoldCount);

  // For unique items, use IMEI-based count as the true stock count
  const displayQty = isUnique ? imeiCount : item.available_qty;
  const displayLowStock = displayQty <= lowStockThreshold;
  const displayOutOfStock = displayQty <= 0;

  return (
    <motion.div
      ref={ref} // Attach ref here
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`
        relative p-2.5 sm:p-3.5 bg-white dark:bg-slate-800 rounded-lg border cursor-pointer active:scale-95
        transition-all duration-200 hover:shadow-lg w-full
        ${displayOutOfStock
          ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
          : displayLowStock
            ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'
            : 'border-slate-200 dark:border-slate-700'
        }
      `}
    >
      {(displayOutOfStock || displayLowStock) && (
        <div className={`
          absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0
          ${displayOutOfStock ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}
        `}>
          {displayOutOfStock ? 'Out' : 'Low'}
        </div>
      )}

      <div className="flex items-start gap-2">
        <div className={`
          w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0
          ${isUnique
            ? 'bg-purple-100 dark:bg-purple-900/30'
            : 'bg-indigo-100 dark:bg-indigo-900/30'
          }
        `}>
          {isUnique ? (
            <Box className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
          ) : (
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate">
                {product.name}
              </h3>
              {product.category && (
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                  {product.category}
                </span>
              )}
            </div>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0 mt-0.5 ml-1" />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-2.5 flex-wrap">
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <div className={`
                w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold
                ${displayOutOfStock
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                  : displayLowStock
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                }
              `}>
                {displayQty}
              </div>
              <span className="text-[9px] sm:text-xs text-slate-500 whitespace-nowrap">in</span>
            </div>

            {item.quantity_sold > 0 && (
              <div className="flex items-center gap-0.5 text-[9px] sm:text-xs text-slate-500 flex-shrink-0">
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500" />
                <span>{item.quantity_sold}s</span>
              </div>
            )}

            {isUnique && (
              <div className="flex items-center gap-0.5 text-[9px] sm:text-xs text-purple-600 dark:text-purple-400 flex-shrink-0 min-w-0">
                <BarChart2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                <span className="truncate">{imeiCount}t</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-1.5 mt-1.5 sm:mt-2 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 truncate" title={formatPrice(product.selling_price ?? 0)}>
              {formatPrice(product.selling_price ?? 0)}
            </span>
            {product.purchase_price != null && (
              <span className="text-[9px] text-slate-400 hidden sm:inline truncate" title={formatPrice(product.purchase_price)}>
                {formatPrice(product.purchase_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default InventoryCard;
