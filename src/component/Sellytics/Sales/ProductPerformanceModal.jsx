/**
 * SwiftCheckout - Product Performance Modal
 * Shows product statistics and performance overview
 * @version 1.0.0
 */
import React, { useState, useEffect } from 'react';
import {
  X, Package, DollarSign, TrendingUp, Users,
  Loader2, AlertCircle, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../supabaseClient';
import { getIdentity } from '../services/identityService';

export default function ProductPerformanceModal({
  product,
  onClose,
  formatPrice
}) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!product?.id) return;

      setLoading(true);
      setError(null);

      try {
        const { currentStoreId } = getIdentity();

        // Fetch sales for this product
        const { data: sales = [], error: salesError } = await supabase
          .from('dynamic_sales')
          .select('*')
          .eq('dynamic_product_id', product.id)
          .eq('store_id', currentStoreId);

        if (salesError) throw salesError;

        // Fetch inventory
        const { data: invData = [], error: invError } = await supabase
          .from('dynamic_inventory')
          .select('*')
          .eq('dynamic_product_id', product.id)
          .eq('store_id', currentStoreId);

        if (invError) throw invError;

        const inventory = invData?.[0] || {};
        const purchasePrice = product.purchase_price || 0;
        const sellingPrice = product.selling_price || 0;

        // Calculate sold count from sales data
        const totalSold = sales.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
        const totalRevenue = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);

        // For unique items, calculate remaining stock from IMEIs - sold IMEIs
        let remaining = inventory.available_qty || 0;

        if (product.is_unique && product.dynamic_product_imeis) {
          const allImeis = product.dynamic_product_imeis.split(',').map(i => i.trim()).filter(Boolean);

          // Extract sold IMEIs from sales data
          const soldImeiSet = new Set();
          sales.forEach(sale => {
            if (sale.status === 'sold' && sale.device_id) {
              sale.device_id.split(',').forEach(id => {
                soldImeiSet.add(id.trim());
              });
            }
          });

          // Calculate: Total IMEIs - Sold IMEIs
          const availableImeis = allImeis.filter(imei => !soldImeiSet.has(imei));
          remaining = availableImeis.length;
        }

        const inventoryValue = remaining * purchasePrice;
        const potentialRevenue = remaining * sellingPrice;

        // Top sellers
        const sellerMap = {};
        sales.forEach(s => {
          const seller = s.created_by_email || 'Staff';
          sellerMap[seller] = (sellerMap[seller] || 0) + Number(s.quantity || 0);
        });
        const topSellers = Object.entries(sellerMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);

        setStats({
          totalSold,
          totalRevenue,
          remaining,
          inventoryValue,
          potentialRevenue,
          purchasePrice,
          sellingPrice,
          topSellers,
          salesCount: sales.length
        });
      } catch (err) {
        console.error('Failed to fetch product stats:', err);
        setError('Failed to load product statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [product?.id, product?.purchase_price, product?.selling_price, product?.is_unique, product?.dynamic_product_imeis]);

  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {product.name}
                </h2>
                <p className="text-sm text-slate-500">
                  Product Performance Overview
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                <p className="text-slate-500">Loading statistics...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard
                    icon={Package}
                    label="Total Sold"
                    value={stats.totalSold}
                    color="blue"
                  />
                  <MetricCard
                    icon={DollarSign}
                    label="Revenue"
                    value={formatPrice(stats.totalRevenue)}
                    color="emerald"
                  />
                  <MetricCard
                    icon={TrendingUp}
                    label="In Stock"
                    value={stats.remaining}
                    color="purple"
                  />
                  <MetricCard
                    icon={DollarSign}
                    label="Stock Value"
                    value={formatPrice(stats.inventoryValue)}
                    color="orange"
                  />
                </div>

                {/* Pricing Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl min-w-0 overflow-hidden">
                    <p className="text-sm text-slate-500 mb-1">Purchase Price</p>
                    <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate" title={formatPrice(stats.purchasePrice)}>
                      {formatPrice(stats.purchasePrice)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl min-w-0 overflow-hidden">
                    <p className="text-sm text-slate-500 mb-1">Selling Price</p>
                    <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate" title={formatPrice(stats.sellingPrice)}>
                      {formatPrice(stats.sellingPrice)}
                    </p>
                  </div>
                </div>

                {/* Top Sellers */}
                {stats.topSellers.length > 0 && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      Top Sellers
                    </h3>
                    <div className="space-y-3">
                      {stats.topSellers.map(([email, qty], i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                              i === 1 ? 'bg-slate-100 text-slate-700' :
                                i === 2 ? 'bg-orange-100 text-orange-700' :
                                  'bg-indigo-100 text-indigo-700'
                              }`}>
                              {i + 1}
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white text-sm truncate">
                              {email}
                            </span>
                          </div>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {qty} unit{qty !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Sales */}
                {stats.totalSold === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No sales recorded for this product yet.</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-6 border-t dark:border-slate-800">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Metric Card Component
function MetricCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-400',
    emerald: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 text-emerald-700 dark:text-emerald-400',
    purple: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 text-purple-700 dark:text-purple-400',
    orange: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 text-orange-700 dark:text-orange-400'
  };

  return (
    <div className={`p-3 sm:p-4 rounded-xl bg-gradient-to-br ${colors[color]} text-center min-w-0 overflow-hidden`}>
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2" />
      <p className="text-xs text-slate-500 mb-0.5 sm:mb-1">{label}</p>
      <p className="text-xs sm:text-sm font-bold truncate" title={value}>{value}</p>
    </div>
  );
}