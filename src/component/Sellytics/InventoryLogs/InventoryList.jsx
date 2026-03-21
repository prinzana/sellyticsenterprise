/**
 * SwiftInventory - Inventory List Component
 * Virtualized list of inventory items with search and filters
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Package, AlertTriangle, 
  ChevronLeft, ChevronRight, Loader2, X, Box
} from 'lucide-react';
import InventoryCard from './InventoryCard';

// Fixed: usePagination was not imported — removed or replaced with simple logic
// We're using the props you already pass: page, totalPages, nextPage, prevPage

export default function InventoryList({
  items = [],
  loading = false,
  searchTerm = '',
  setSearchTerm,
  categoryFilter = 'all',
  setCategoryFilter,
  stockFilter = 'all',
  setStockFilter,
  categories = [],
  page = 1,
  totalPages = 1,
  hasNextPage = false,
  hasPrevPage = false,
  nextPage,
  prevPage,
  totalItems = 0,
  onItemClick,
  formatPrice,
  lowStockThreshold = 10
}) {
  // Simple goToPage function (since usePagination is missing)
  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    if (pageNum === page) return;

    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // You can implement actual page change in parent
    // For now, just call prev/next accordingly
    if (pageNum > page && nextPage) {
      for (let i = page; i < pageNum; i++) nextPage();
    } else if (pageNum < page && prevPage) {
      for (let i = page; i > pageNum; i--) prevPage();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 pb-3 space-y-3 pt-2">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, barcodes, IMEIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {/* Stock Filter */}
          <div className="flex gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            {[
              { value: 'all', label: 'All', icon: Package },
              { value: 'low', label: 'Low', icon: AlertTriangle },
              { value: 'out', label: 'Out', icon: X },
              { value: 'in', label: 'In Stock', icon: Box }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setStockFilter(value)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap
                  ${stockFilter === value
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 min-w-[140px]"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{totalItems} items</span>
          {totalPages > 1 && (
            <span>Page {page} of {totalPages}</span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-3 text-slate-600">Loading inventory...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-slate-500 max-w-sm">
            {searchTerm 
              ? 'Try adjusting your search or filters'
              : 'Your inventory is empty. Add products to get started'
            }
          </p>
        </div>
      )}

      {/* Inventory Grid */}
      {!loading && items.length > 0 && (
        <div className="-mx-4 sm:mx-0 grid gap-0 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {items.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <InventoryCard
                  item={item}
                  lowStockThreshold={lowStockThreshold}
                  onClick={() => onItemClick?.(item)}
                  formatPrice={formatPrice}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={prevPage}
            disabled={!hasPrevPage}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  disabled={pageNum === page}
                  className={`
                    w-10 h-10 rounded-lg text-sm font-medium transition-all
                    ${pageNum === page
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={nextPage}
            disabled={!hasNextPage}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}