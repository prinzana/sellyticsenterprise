import React from 'react';
import { motion } from 'framer-motion';
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { useCurrency } from '../../context/currencyContext';

export default function ExpenseTable({ expenses, onView, onEdit, onDelete }) {
  const { preferredCurrency = { code: 'USD', symbol: '$' } } = useCurrency() || {};

  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        <p className="text-xl font-medium">No expenses recorded yet</p>
        <p className="text-sm mt-2">Click "Add Expense" to get started.</p>
      </div>
    );
  }

  return (
    <div className="-mx-4 sm:mx-0 flex flex-col border-y border-slate-200 dark:border-slate-800 sm:border-y-0 sm:space-y-4 pb-4 sm:pb-0 transition-all">
      {expenses.map((expense) => {
        const date = expense.expense_date
          ? new Date(expense.expense_date).toLocaleDateString(undefined, {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'N/A';

        const amountValue = Number(expense.amount || 0);
        const formattedAmount = amountValue.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });

        return (
          <motion.div
            key={expense.id}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative p-3.5 sm:p-5 bg-white dark:bg-slate-800 rounded-none sm:rounded-2xl border-b border-x-0 sm:border border-slate-100 dark:border-slate-700 sm:border-slate-200 transition-all duration-300 sm:hover:shadow-lg w-full"
          >
            {/* Main Content */}
            <div className="flex items-center gap-3 sm:gap-5 pr-[3.5rem] sm:pr-0">
              {/* Left: Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50 dark:bg-indigo-900/30">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
              </div>

              {/* Middle: Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                 <div className="flex items-center justify-between gap-2 w-full">
                   <h3 className="font-bold text-[13px] sm:text-lg text-slate-900 dark:text-white truncate">
                     {expense.category || 'Uncategorized'}
                   </h3>
                   <span className="font-black text-[13px] sm:text-lg text-red-600 dark:text-red-400 flex-shrink-0">
                     {preferredCurrency.symbol}{formattedAmount}
                   </span>
                 </div>
                 
                 <div className="flex items-center justify-between gap-2 w-full">
                   <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 truncate font-medium">
                     {expense.description || 'No description'}
                   </p>
                   <div className="flex items-center gap-1 text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 flex-shrink-0 font-medium">
                     <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                     <span>{date}</span>
                   </div>
                 </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden sm:block ml-4 flex-shrink-0">
                <ExpenseActions
                  expense={expense}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            </div>

            {/* Mobile Actions Menu - absolute top-right aligned perfectly to center */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 sm:hidden">
              <ExpenseActions
                expense={expense}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function ExpenseActions({ expense, onView, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="relative">
      <button
        aria-label="More actions"
        aria-haspopup="true"
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu((prev) => !prev);
        }}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Dropdown Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
            role="menu"
          >
            <button
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onView?.(expense);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
            >
              <Eye className="w-4 h-4" /> View
            </button>

            <button
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onEdit?.(expense);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>

            <button
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                if (window.confirm(`Delete expense "${expense.description || 'this item'}"?`)) {
                  onDelete?.(expense.id);
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}