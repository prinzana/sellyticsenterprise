import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Award, Search } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

export default function TopProductsList({ topProducts, onDelete }) {

  const [showList, setShowList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products by search query
  const filteredProducts = topProducts.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (topProducts.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header with Toggle */}
      <button
        onClick={() => setShowList(!showList)}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-t-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Selling Products</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Top {filteredProducts.length} performers
            </p>
          </div>
        </div>
        {showList ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {showList && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          {/* Search Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Products Cards */}
          <div className="space-y-4 p-4 sm:p-6">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400">
                No matching products found
              </p>
            ) : (
              filteredProducts.map((product, index) => (
                <TopProductCard
                  key={index}
                  product={product}
                  rank={index + 1}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual Top Product Card
function TopProductCard({ product, rank, onDelete }) {

  const { formatPrice } = useCurrency();



  // Rank badge styling
  const rankStyle = {
    1: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    2: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    3: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  }[rank] || 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 hover:shadow-md transition-all relative"
    >
      {/* Top row: Rank + Product Info + Menu */}
      <div className="flex items-start justify-between gap-3">
        {/* Rank Badge */}
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${rankStyle}`}>
          {rank}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate">
            {product.name}
          </h3>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {product.quantity} units sold
          </div>
        </div>


      </div>

      {/* Bottom row: Sales Amount */}
      <div className="mt-4 flex items-center gap-2 text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400 min-w-0">
        <span className="truncate" title={formatPrice(product.amount)}>{formatPrice(product.amount)}</span>
      </div>
    </motion.div>
  );
}