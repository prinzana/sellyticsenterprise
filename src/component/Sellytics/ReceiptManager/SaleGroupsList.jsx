import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Table, LayoutGrid, Trash2, CheckSquare, Square, Edit } from 'lucide-react';
import { useCurrency } from '../../context/currencyContext';

const VIEW_MODES = {
  TABLE: 'table',
  CARD: 'card'
};

const VIEW_PREFERENCE_KEY = 'saleGroups_view_mode';

export default function SaleGroupsList({
  saleGroups,
  selectedGroup,
  onSelectGroup,
  canDelete,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  currentPage,
  onPageChange,
  itemsPerPage = 20,
  currentPlan,
  onLock,
  onEditGroup,
  onBulkDelete
}) {
  const { formatPrice } = useCurrency();

  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem(VIEW_PREFERENCE_KEY);
    return saved === VIEW_MODES.CARD ? VIEW_MODES.CARD : VIEW_MODES.TABLE;
  });

  useEffect(() => {
    localStorage.setItem(VIEW_PREFERENCE_KEY, viewMode);
  }, [viewMode]);

  const toggleView = () => {
    setViewMode(prev => prev === VIEW_MODES.TABLE ? VIEW_MODES.CARD : VIEW_MODES.TABLE);
  };

  const totalPages = Math.ceil(saleGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGroups = saleGroups.slice(startIndex, startIndex + itemsPerPage);
  const allSelected = paginatedGroups.length > 0 && paginatedGroups.every(g => selectedIds.includes(g.id));

  if (saleGroups.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No sale groups found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={toggleView}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-sm font-medium text-sm"
          >
            {viewMode === VIEW_MODES.TABLE ? (
              <>
                <LayoutGrid className="w-4 h-4" />
                Card View
              </>
            ) : (
              <>
                <Table className="w-4 h-4" />
                Table View
              </>
            )}
          </button>

          {canDelete && paginatedGroups.length > 0 && (
            <button
              onClick={() => {
                if (currentPlan === 'FREE') onLock('feature_locked');
                else onToggleSelectAll(paginatedGroups);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-sm font-medium text-sm"
            >
              <div className="relative">
                {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                {currentPlan === 'FREE' && (
                  <div className="absolute -top-1 -right-1">
                    <svg className="w-2 h-2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                )}
              </div>
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
          )}

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-semibold">
                {selectedIds.length} selected
              </span>
              {canDelete && onBulkDelete && (
                <button
                  onClick={onBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg transition-all font-semibold text-sm shadow-sm shadow-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete Selected</span>
                  <span className="sm:hidden">Delete</span>
                </button>
              )}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center sm:justify-end gap-3">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm font-medium shadow-sm"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm font-medium shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Table View - Hidden on Mobile, Responsive on Desktop */}
      {viewMode === VIEW_MODES.TABLE && (
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
              <tr>
                {canDelete && (
                  <th className="text-left px-3 sm:px-4 py-4 w-12">
                    <button
                      onClick={() => {
                        if (currentPlan === 'FREE') onLock('feature_locked');
                        else onToggleSelectAll(paginatedGroups);
                      }}
                      className="hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors"
                    >
                      <div className="relative">
                        {allSelected ?
                          <CheckSquare className="w-5 h-5 text-indigo-600" /> :
                          <Square className="w-5 h-5 text-slate-400" />
                        }
                        {currentPlan === 'FREE' && (
                          <div className="absolute -top-1 -right-1">
                            <svg className="w-2.5 h-2.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  </th>
                )}
                <th className="text-left px-3 sm:px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Sale ID</th>
                <th className="text-left px-3 sm:px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Amount</th>
                <th className="hidden lg:table-cell text-left px-3 sm:px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Payment</th>
                <th className="hidden sm:table-cell text-left px-3 sm:px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Date</th>
                <th className="text-left px-3 sm:px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <AnimatePresence>
                {paginatedGroups.map((group, idx) => {
                  const isSelected = selectedIds.includes(group.id);
                  return (
                    <motion.tr
                      key={group.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`cursor-pointer transition-all ${selectedGroup?.id === group.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20'
                        : isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/10'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      onClick={(e) => {
                        if (!e.target.closest('button')) {
                          onSelectGroup(group);
                        }
                      }}
                    >
                      {canDelete && (
                        <td className="px-3 sm:px-4 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentPlan === 'FREE') onLock('feature_locked');
                              else onToggleSelect(group.id);
                            }}
                            className="hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded transition-colors"
                          >
                            <div className="relative">
                              {isSelected ?
                                <CheckSquare className="w-5 h-5 text-indigo-600" /> :
                                <Square className="w-5 h-5 text-slate-400" />
                              }
                              {currentPlan === 'FREE' && (
                                <div className="absolute -top-1 -right-1">
                                  <svg className="w-2.5 h-2.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        </td>
                      )}
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="font-semibold text-slate-900 dark:text-white truncate">#{group.id}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400 max-w-[150px]">
                        <span className="truncate block text-sm" title={formatPrice(group.total_amount)}>
                          {formatPrice(group.total_amount)}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-6 py-4">
                        <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                          {group.payment_method}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-4 text-slate-600 dark:text-slate-400 font-medium text-sm whitespace-nowrap">
                        {new Date(group.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {onEditGroup && (
                            <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 onEditGroup(group);
                               }}
                               className="p-2 rounded-lg transition-colors text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                               title="Edit Sale"
                            >
                               <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (currentPlan === 'FREE') onLock('feature_locked');
                                else onToggleSelect(group.id);
                              }}
                              className={`p-2 rounded-lg transition-colors ${currentPlan === 'FREE' ? 'text-slate-300' : 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                              title="Delete Sale"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Table View - Compact list rows on mobile */}
      {viewMode === VIEW_MODES.TABLE && (
        <div className="md:hidden -mx-4 sm:mx-0 flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60 sm:space-y-3 sm:divide-y-0">
          <AnimatePresence>
            {paginatedGroups.map((group, idx) => {
              const isSelected = selectedIds.includes(group.id);
              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => onSelectGroup(group)}
                  className={`
                    relative p-3 sm:p-4 transition-all cursor-pointer sm:rounded-xl sm:border-2
                    ${selectedGroup?.id === group.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 sm:border-indigo-500'
                      : isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/10 sm:border-blue-400'
                        : 'bg-white dark:bg-slate-900 sm:border-slate-200 dark:sm:border-slate-700 hover:sm:border-indigo-300'
                    }
                  `}
                >
                  <div className="flex gap-2 items-center absolute top-1/2 -translate-y-1/2 right-2 sm:right-3 z-10">
                    {onEditGroup && (
                      <button
                        onClick={(e) => {
                           e.stopPropagation();
                           onEditGroup(group);
                        }}
                        className="p-1.5 sm:p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700"
                        title="Edit Sale"
                      >
                         <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentPlan === 'FREE') onLock('feature_locked');
                          else onToggleSelect(group.id);
                        }}
                        className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700"
                        title="Delete Sale"
                      >
                        <div className="relative">
                          {isSelected ?
                            <CheckSquare className="w-4 h-4 text-red-600" /> :
                            <Trash2 className="w-4 h-4" />
                          }
                          {currentPlan === 'FREE' && (
                            <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 rounded-full">
                               <svg className="w-2h-2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pr-[4.5rem] sm:pr-24">
                     <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                       <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 dark:text-indigo-400" />
                     </div>
                     
                     <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span className="font-bold text-[13px] sm:text-base text-slate-900 dark:text-white truncate">Sale #{group.id}</span>
                          <span className="text-[13px] sm:text-base font-black text-slate-900 dark:text-white flex-shrink-0">
                            {formatPrice(group.total_amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                            {new Date(group.created_at).toLocaleDateString('en-US', {
                              weekday: 'short', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                          <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 text-[9px] sm:text-[10px] uppercase font-bold rounded flex-shrink-0">
                            {group.payment_method}
                          </span>
                        </div>
                     </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Card View */}
      {viewMode === VIEW_MODES.CARD && (
        <div className="-mx-4 sm:mx-0 flex flex-col gap-0 border-y border-slate-100 dark:border-slate-800/60 sm:border-y-0 divide-y divide-slate-100 dark:divide-slate-800/60 sm:gap-4 sm:divide-y-0">
          <AnimatePresence>
            {paginatedGroups.map((group, index) => {
              const isSelected = selectedIds.includes(group.id);
              return (
                <motion.div
                  key={group.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => onSelectGroup(group)}
                  className={`
                    relative p-3.5 sm:p-5 w-full transition-all cursor-pointer
                    bg-white dark:bg-slate-900
                    sm:rounded-2xl sm:border-2 sm:shadow-sm sm:hover:shadow-lg
                    ${selectedGroup?.id === group.id
                      ? 'bg-indigo-50/50 dark:bg-indigo-900/10 sm:border-indigo-500 sm:ring-4 ring-indigo-500/20'
                      : isSelected
                        ? 'bg-blue-50/50 dark:bg-blue-900/10 sm:border-blue-400 sm:ring-2 ring-blue-400/20'
                        : 'sm:border-slate-200 dark:sm:border-slate-700 hover:sm:border-indigo-300 dark:hover:sm:border-indigo-600'
                    }
                  `}
                >
                  <div className="flex gap-2 items-center absolute top-1/2 -translate-y-1/2 sm:top-4 sm:translate-y-0 right-2 sm:right-4 z-10">
                    {onEditGroup && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditGroup(group);
                        }}
                        className="p-1.5 sm:p-2 rounded-xl text-indigo-600 hover:text-indigo-700 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors shadow-sm sm:shadow-md border border-slate-100 dark:border-slate-700"
                        title="Edit Sale"
                      >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentPlan === 'FREE') onLock('feature_locked');
                          else onToggleSelect(group.id);
                        }}
                        className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-red-600 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-sm sm:shadow-md border border-slate-100 dark:border-slate-700"
                        title="Delete Sale"
                      >
                        <div className="relative">
                          {isSelected ?
                            <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" /> :
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          }
                          {currentPlan === 'FREE' && (
                            <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 rounded-full">
                              <svg className="w-2.5 h-2.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 pr-[5.5rem] sm:pr-28 w-full">
                    {/* Compact Icon on mobile, bigger on desktop */}
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                      <Package className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>

                    {/* Content Grouped Horizontally on Mobile for compact space */}
                    <div className="flex-1 min-w-0 flex flex-col sm:block justify-center h-full">
                      <div className="flex items-center sm:block justify-between gap-2 w-full">
                        <h3 className="font-bold text-[13px] sm:text-lg text-slate-900 dark:text-white truncate flex-1">
                          Sale #{group.id}
                        </h3>
                        <p className="sm:hidden text-[13px] font-black text-slate-900 dark:text-white flex-shrink-0" title={formatPrice(group.total_amount)}>
                           {formatPrice(group.total_amount)}
                        </p>
                      </div>
                      
                      {/* Desktop only price */}
                      <p className="hidden sm:block text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate" title={formatPrice(group.total_amount)}>
                        {formatPrice(group.total_amount)}
                      </p>

                      <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 mt-1 sm:mt-3 w-full">
                         <div className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate flex-1">
                           {new Date(group.created_at).toLocaleDateString('en-US', {
                             weekday: 'short', month: 'short', day: 'numeric',
                             hour: '2-digit', minute: '2-digit'
                           })}
                         </div>
                         <span className="text-slate-300 dark:text-slate-600 hidden sm:block">•</span>
                         <span className="px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-md text-[9px] sm:text-xs font-bold uppercase tracking-wide flex-shrink-0">
                           {group.payment_method}
                         </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}