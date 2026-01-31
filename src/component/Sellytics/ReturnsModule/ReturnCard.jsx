/**
 * ReturnCard Component - Highly Mobile-Responsive
 * - Full left-aligned content on mobile
 * - MoreVertical always top-right
 * - Clean desktop layout preserved
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useCurrency } from '../../context/currencyContext';

export default function ReturnCard({
  returnItem,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelect,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
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

  const statusColors = {
    Pending: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    Approved: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    Rejected: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    Refunded: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
  };

  const statusColorClass = statusColors[returnItem.status] || statusColors.Pending;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        relative w-full mb-8
        bg-white dark:bg-slate-800
        rounded-xl border
        ${isSelected
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
          : 'border-slate-200 dark:border-slate-700 hover:shadow-lg'
        }
        transition-all cursor-pointer p-5
      `}
      onClick={onToggleSelect}
    >
      {/* Header Row - Always keeps menu top-right */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon + Checkbox */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-red-100 dark:bg-red-900/30">
            <Package className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            className="absolute -top-2 -left-2"
          >
            {isSelected ? (
              <CheckSquare className="w-6 h-6 text-indigo-600 drop-shadow" />
            ) : (
              <Square className="w-6 h-6 text-slate-400 drop-shadow" />
            )}
          </button>
        </div>

        {/* Center: Product Name + Amount + Status */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white text-lg truncate">
            {returnItem.product_name}
          </h3>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm sm:text-base font-bold max-w-[200px]" title={formatPrice(returnItem.amount)}>
              {formatPrice(returnItem.amount)}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColorClass}`}>
              {returnItem.status}
            </span>
          </div>

          {/* Product ID */}
          {returnItem.device_id && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 break-all">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Product ID:
              </span>{' '}
              {returnItem.device_id}
            </p>
          )}
        </div>

        {/* Right: More Menu - Always top-right */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className="p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-slate-500" />
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
                className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(returnItem);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Edit className="w-5 h-5" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete return for "${returnItem.product_name}"?`)) {
                      onDelete(returnItem.id);
                    }
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(returnItem.returned_date).toLocaleDateString()}</span>
          </div>
          <span className="break-all">
            Receipt:{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {returnItem.receipt_code}
            </span>
          </span>
        </div>

        {/* Remark */}
        {returnItem.remark && (
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Reason
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {returnItem.remark}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}