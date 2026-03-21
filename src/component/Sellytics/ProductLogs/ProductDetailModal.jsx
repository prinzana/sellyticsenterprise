/**
 * Detail Modal - View product details and IMEI status
 */
import React, { useState, useEffect, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../../supabaseClient';

export default function DetailModal({ product, storeId, formatPrice, isOpen, onClose }) {
  const [soldImeis, setSoldImeis] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const allImeis = useMemo(() => {
    if (!product.dynamic_product_imeis) return [];

    const imeis = product.dynamic_product_imeis.split(',').map(s => s.trim()).filter(Boolean);
    const sizes = product.device_size ? product.device_size.split(',').map(s => s.trim()) : [];

    return imeis.map((imei, index) => ({
      imei,
      size: sizes[index] || ''
    }));
  }, [product]);

  const filteredImeis = useMemo(() => {
    if (!searchTerm) return allImeis;

    const query = searchTerm.toLowerCase();
    return allImeis.filter(item =>
      item.imei.toLowerCase().includes(query) ||
      item.size.toLowerCase().includes(query)
    );
  }, [allImeis, searchTerm]);

  const totalPages = Math.ceil(filteredImeis.length / itemsPerPage);
  const paginatedImeis = filteredImeis.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (!isOpen || !product.is_unique || allImeis.length === 0) {
      setLoading(false);
      return;
    }

    const fetchSoldStatus = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('dynamic_sales')
          .select('device_id')
          .eq('store_id', storeId);

        if (error) throw error;

        const soldSet = new Set();
        data.forEach(sale => {
          if (sale.device_id) {
            sale.device_id
              .toString()
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
              .forEach(id => soldSet.add(id));
          }
        });

        setSoldImeis(soldSet);
      } catch (err) {
        console.error('Failed to fetch sold status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSoldStatus();
  }, [product, isOpen, storeId, allImeis.length]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {product.name}
            </h2>
            {product.description && (
              <p className="text-sm text-slate-500 mt-1">{product.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl min-w-0 overflow-hidden">
              <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mb-1">Purchase Price</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate" title={formatPrice(product.purchase_price || 0)}>
                {formatPrice(product.purchase_price || 0)}
              </div>
            </div>
            <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl min-w-0 overflow-hidden">
              <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mb-1">Selling Price</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate" title={formatPrice(product.selling_price || 0)}>
                {formatPrice(product.selling_price || 0)}
              </div>
            </div>
            <div className="p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl min-w-0 overflow-hidden">
              <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mb-1">Quantity</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {product.is_unique ? allImeis.length : product.purchase_qty || 0}
              </div>
            </div>
            <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl min-w-0 overflow-hidden">
              <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mb-1">Type</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {product.is_unique ? 'Unique' : 'Standard'}
              </div>
            </div>
            {product.suppliers_name && (
              <div className="col-span-2 lg:col-span-4 p-3 sm:p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl min-w-0 overflow-hidden border border-slate-100 dark:border-slate-700">
                <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mb-1">Supplier</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate" title={product.suppliers_name}>
                  {product.suppliers_name}
                </div>
              </div>
            )}
          </div>

          {product.is_unique && allImeis.length > 0 && (
            <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-semibold flex-shrink-0 text-slate-900 dark:text-white">
                  Unique Items <span className="text-slate-500 font-normal text-sm">({filteredImeis.length} of {allImeis.length})</span>
                </h3>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search IMEI / Size..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-64 pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 text-slate-500">
                  Loading status...
                </div>
              ) : paginatedImeis.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No items found
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {paginatedImeis.map(({ imei, size }) => {
                      const isSold = soldImeis.has(imei);
                      return (
                        <div
                          key={imei}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isSold
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                            }`}
                        >
                          <div>
                            <div className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                              {imei}
                            </div>
                            {size && (
                              <div className="text-xs text-slate-500 mt-1">Size: {size}</div>
                            )}
                          </div>
                          <span
                            className={`px-4 py-2 rounded-full text-xs font-bold ${isSold
                              ? 'bg-red-600 text-white'
                              : 'bg-emerald-600 text-white'
                              }`}
                          >
                            {isSold ? 'SOLD' : 'IN STOCK'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between sm:justify-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-700 dark:text-slate-300"
                      >
                        Previous
                      </button>
                      
                      <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                         Page {currentPage} of {totalPages}
                      </div>

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 disabled:bg-slate-100 disabled:text-slate-400 disabled:dark:bg-slate-800 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {!product.is_unique && (
            <div className="text-center py-8 border-t border-slate-200 dark:border-slate-800">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl font-bold text-indigo-700 dark:text-indigo-300">
                  {product.purchase_qty || 0}
                </span>
              </div>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                Units in Stock
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}