// src/components/Suppliers/SuppliersTableRow.jsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MoreVertical,
  Package,
  Calendar,

  Trash2,
  Eye,
  Edit
} from 'lucide-react';

function ActionsMenu({ onViewIds, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(v => !v);
        }}
        className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
        >
          {onViewIds && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onViewIds();
              }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 transition"
            >
              <Eye className="w-4 h-4" /> View Serials/IDs
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onEdit();
            }}
            className="w-full text-left px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 transition"
          >
            <Edit className="w-4 h-4" /> Edit Entry
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition"
          >
            <Trash2 className="w-4 h-4" /> Delete Entry
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function SuppliersTableRow({
  item,
  onViewIds,
  onEdit,
  onDelete,
  onViewSupplier
}) {
  const createdAt = useMemo(
    () => new Date(item.created_at).toLocaleDateString(),
    [item.created_at]
  );

  // ✅ SAFE NORMALIZATION (flat or joined data)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative p-3.5 sm:p-5 bg-white dark:bg-slate-800 rounded-none sm:rounded-2xl border-b border-x-0 sm:border border-slate-100 dark:border-slate-700 sm:border-slate-200 w-full hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300 cursor-pointer"
      onClick={onViewSupplier}
    >
      <div className="flex items-center gap-3 sm:gap-4 w-full pr-1 sm:pr-2">
        {/* Left: Icon */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50 dark:bg-indigo-900/30">
          <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Middle: Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 sm:gap-1">
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-bold text-[13px] sm:text-lg text-slate-900 dark:text-white truncate">
                {item.device_name}
              </h3>
              {/* Supplier Badge Desktop */}
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-[10px] font-bold uppercase tracking-wider flex-shrink-0 border bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400">
                {item.supplier_name || item.supplier?.name || 'Unknown'}
              </span>
            </div>

            {/* Quantity */}
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="font-black text-[14px] sm:text-xl text-indigo-600 dark:text-indigo-400">
                {item.qty}
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide">Stock</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="sm:hidden font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[80px]">
                {item.supplier_name || item.supplier?.name || 'Unknown'}
              </span>
              <span className="sm:hidden text-slate-300 dark:text-slate-600">•</span>

              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="truncate flex-1">
                {createdAt}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="shrink-0 flex items-center justify-center -mr-2">
          <ActionsMenu onViewIds={onViewIds} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </motion.div>
  );
}
