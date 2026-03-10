/**
 * SwiftCheckout - Sales History Component
 * Displays list of completed sales with filters
 * @version 2.0.0
 */
import React, { useState, useMemo } from 'react';
import {
  Package, Calendar, CreditCard, User, Eye, Edit2,
  Trash2, Hash, ChevronLeft, ChevronRight, Search, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import useCurrency from './hooks/useCurrency';
import CustomDropdown, { DropdownItem, DropdownSeparator } from './CustomDropdown';

export default function SalesHistory({
  sales,
  isOwner,
  isOnline,
  onViewSale,
  onViewProduct,
  onEditSale,
  onDeleteSale,
  search,
  setSearch,
  dateFilter = 'all',
  onDateFilterChange,
  currentPlan,
  onLock
}) {
  const { formatPrice } = useCurrency();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter sales by search
  const searchFiltered = useMemo(() => {
    if (!search) return sales;
    const lower = search.toLowerCase();
    return sales.filter(s =>
      s.product_name?.toLowerCase().includes(lower) ||
      s.customer_name?.toLowerCase().includes(lower) ||
      s.device_id?.toLowerCase().includes(lower)
    );
  }, [sales, search]);

  // Filter sales by date
  const filteredByDate = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    switch (dateFilter) {
      case 'today':
        return searchFiltered.filter(s => new Date(s.sold_at) >= today);
      case 'week':
        return searchFiltered.filter(s => new Date(s.sold_at) >= weekAgo);
      case 'month':
        return searchFiltered.filter(s => new Date(s.sold_at) >= monthAgo);
      default:
        return searchFiltered;
    }
  }, [searchFiltered, dateFilter]);

  const totalPages = Math.ceil(filteredByDate.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredByDate.slice(startIndex, startIndex + itemsPerPage);

  const isRestrictedByPlan = currentPlan === 'FREE';
  const PLAN_LIMIT = 10;

  // Totals for filtered period
  const filteredTotal = useMemo(() => {
    return filteredByDate.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  }, [filteredByDate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'MMM d, h:mm a');
    } catch {
      return dateStr;
    }
  };

  const canEdit = (sale) => isOwner;
  const canDelete = (sale) => isOwner;

  const handleDelete = async (sale) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) return;

    const success = await onDeleteSale(sale.id);
    if (success) {
      toast.success('Sale deleted');
    } else {
      toast.error('Failed to delete sale');
    }
  };

  const paymentColors = {
    'Cash': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Bank Transfer': 'bg-violet-50 text-violet-700 border-violet-200',
    'Card': 'bg-blue-50 text-blue-700 border-blue-200',
    'Wallet': 'bg-amber-50 text-amber-700 border-amber-200'
  };

  if (sales.length === 0) {
    return (
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-white dark:bg-slate-900 border-t border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 md:px-5 lg:px-6 py-8 sm:py-12 text-center">
        <Package className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto text-slate-300 mb-3 sm:mb-4" />
        <p className="text-slate-500 text-base sm:text-lg font-medium">No sales found</p>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Create your first sale to get started</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Search & Filter Header */}
      <div className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 space-y-2.5 sm:space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sales..."
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
          {['all', 'today', 'week', 'month'].map(filter => (
            <button
              key={filter}
              onClick={() => {
                onDateFilterChange?.(filter);
                setCurrentPage(1);
              }}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-colors capitalize active:scale-95 ${dateFilter === filter
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              {filter}
            </button>
          ))}

          {/* Totals Badge */}
          <div className="ml-auto text-xs sm:text-xs font-medium text-emerald-600 dark:text-emerald-400 flex-shrink-0 max-w-[50%] truncate" title={`${filteredByDate.length} sales • ${formatPrice(filteredTotal)}`}>
            {filteredByDate.length} • {formatPrice(filteredTotal)}
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="w-full divide-y divide-slate-100 dark:divide-slate-800">
        <AnimatePresence>
          {paginatedSales.map((sale, idx) => (
            <motion.div
              key={sale.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`px-3 sm:px-4 md:px-5 py-3 sm:py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative ${isRestrictedByPlan && startIndex + idx >= PLAN_LIMIT ? 'blur-[4.5px] pointer-events-none' : ''}`}
            >
              {isRestrictedByPlan && startIndex + idx === PLAN_LIMIT && (
                <div
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-[2px] cursor-pointer pointer-events-auto group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLock('feature_locked');
                  }}
                >
                  <div className="bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg transform group-hover:scale-105 transition-transform">
                    UPGRADE TO SEE MORE SALES
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                {/* Left: Product Info */}
                <div
                  className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 cursor-pointer group"
                  onClick={() => onViewProduct?.(sale)}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors text-xs sm:text-sm">
                      {sale.product_name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{sale.customer_name || 'Walk-in'}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Details */}
                <div className="hidden md:flex items-center gap-2 lg:gap-3">
                  {/* Quantity */}
                  <div className="text-center flex-shrink-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300">
                      {sale.quantity}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className={`flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs border flex-shrink-0 ${paymentColors[sale.payment_method] || paymentColors['Cash']}`}>
                    <CreditCard className="w-3 h-3" />
                    <span className="hidden lg:inline">{sale.payment_method}</span>
                  </div>

                  {/* Date */}
                  <div className="items-center gap-0.5 text-xs text-slate-500 flex-shrink-0 hidden lg:flex">
                    <Calendar className="w-3 h-3" />
                    {formatDate(sale.sold_at)}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 ml-1 sm:ml-2 md:ml-3 flex-shrink-0">
                  <div className="text-right min-w-0 max-w-[120px] sm:max-w-[160px]">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm truncate" title={formatPrice(sale.amount)}>
                      {formatPrice(sale.amount)}
                    </div>
                    {sale.deviceIds?.length > 0 && (
                      <div className="flex items-center gap-0.5 text-xs text-slate-500 justify-end mt-0.5">
                        <Hash className="w-2.5 h-2.5" />
                        <span className="text-xs">{sale.deviceIds.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <CustomDropdown>
                    {({ close }) => (
                      <>
                        <DropdownItem
                          icon={Eye}
                          onClick={() => {
                            onViewSale?.(sale);
                            close();
                          }}
                        >
                          View Details
                        </DropdownItem>

                        <DropdownItem
                          icon={Package}
                          onClick={() => {
                            onViewProduct?.(sale);
                            close();
                          }}
                        >
                          Product Stats
                        </DropdownItem>

                        {sale.deviceIds?.length > 0 && (
                          <DropdownItem
                            icon={Hash}
                            onClick={() => {
                              toast.info(`Product IDs: ${sale.deviceIds.join(', ')}`);
                              close();
                            }}
                          >
                            View IDs ({sale.deviceIds.length})
                          </DropdownItem>
                        )}

                        {canEdit(sale) && (
                          <>
                            <DropdownSeparator />
                            <DropdownItem
                              icon={Edit2}
                              onClick={() => {
                                onEditSale?.(sale);
                                close();
                              }}
                            >
                              Edit Sale
                            </DropdownItem>
                          </>
                        )}

                        {canDelete(sale) && (
                          <>
                            <DropdownSeparator />
                            <DropdownItem
                              icon={Trash2}
                              variant="danger"
                              onClick={() => {
                                handleDelete(sale);
                                close();
                              }}
                              disabled={!isOnline}  // ← DISABLE DELETE WHEN OFFLINE
                              className={!isOnline ? 'opacity-50 cursor-not-allowed' : ''}  // ← Visual gray-out
                            >
                              {isOnline ? 'Delete Sale' : 'Delete Sale (offline - disabled)'}
                            </DropdownItem>
                          </>
                        )}
                      </>
                    )}
                  </CustomDropdown>
                </div>
              </div>

              {/* Mobile: Extra Info */}
              <div className="md:hidden mt-2 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                <span className="text-xs">{formatDate(sale.sold_at)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs sm:text-sm text-slate-500 order-2 sm:order-1">
            {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredByDate.length)} of {filteredByDate.length}
          </span>

          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 sm:w-4 sm:h-4" />
            </button>

            <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium min-w-fit">
              {currentPage}/{totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
            >
              <ChevronRight className="w-4 h-4 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}


    </div>
  );
}