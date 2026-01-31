/**
 * SwiftInventory - Product Detail Sheet
 * Bottom drawer modal for product details and actions
 */
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Package, Box, Clock, Plus, Edit2, Trash2, RefreshCw,
  DollarSign, Percent, Calendar
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../../supabaseClient';

import useCurrency from './hooks/useCurrency'; // Adjust path if needed
import useProductAnalytics from '../InventoryLogs/hooks/useProductAnalytics';

export default function ProductDetailSheet({
  item,
  storeId,
  canAdjust,
  canDelete,
  onClose,
  onEdit,
  onRestock,
  onAdjustQty,
  onEditImeis,
  onDelete,
}) {
  const { formatPrice } = useCurrency(); // Get dynamic currency formatter

  const product = item?.dynamic_product;
  const [activeTab, setActiveTab] = useState('overview');
  const [soldImeis, setSoldImeis] = useState(new Set());

  const {
    salesTrends,
    profitability,
    restockHistory,
    avgStockLife,
    forecastDays
  } = useProductAnalytics(product?.id, storeId);

  // Fetch sold IMEIs for unique products
  useEffect(() => {
    if (!product?.is_unique || !storeId) return;

    const fetchSoldImeis = async () => {
      try {
        const { data, error } = await supabase
          .from('dynamic_sales')
          .select('device_id')
          .eq('store_id', storeId);

        if (error) throw error;

        const soldSet = new Set();
        data?.forEach(sale => {
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
        console.error('Failed to fetch sold IMEIs:', err);
      }
    };

    fetchSoldImeis();
  }, [product?.is_unique, storeId]);

  const isUnique = product?.is_unique;
  const imeis = useMemo(() => {
    return isUnique && product?.dynamic_product_imeis
      ? product.dynamic_product_imeis.split(',').map(i => i.trim()).filter(Boolean)
      : [];
  }, [isUnique, product?.dynamic_product_imeis]);

  // Calculate actual sold count from IMEIs for unique products
  const actualSoldCount = useMemo(() => {
    if (!isUnique || !item) return item?.quantity_sold || 0;
    return imeis.filter(imei => soldImeis.has(imei)).length;
  }, [isUnique, imeis, soldImeis, item]);

  // Calculate actual available count for unique products
  const actualAvailableCount = useMemo(() => {
    if (!isUnique || !item) return item?.available_qty || 0;
    return imeis.length - actualSoldCount;
  }, [isUnique, imeis.length, actualSoldCount, item]);

  if (!item || !product) return null;

  return (

    <AnimatePresence>

      <motion.div

        initial={{ opacity: 0 }}

        animate={{ opacity: 1 }}

        exit={{ opacity: 0 }}

        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-2 sm:p-4"

        onClick={onClose}

      >

        <motion.div

          initial={{ y: '100%' }}

          animate={{ y: 0 }}

          exit={{ y: '100%' }}

          transition={{ type: 'spring', damping: 25, stiffness: 300 }}

          className="w-full sm:w-[90%] md:w-3/4 lg:w-2/3 max-h-[90vh] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"

          onClick={e => e.stopPropagation()}

        >

          {/* Handle */}

          <div className="flex justify-center py-3 sm:hidden">

            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />

          </div>



          {/* Header */}

          <div className="flex justify-between items-center p-3 sm:p-5 border-b dark:border-slate-800">

            <div className="flex items-start gap-3">

              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${isUnique ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'

                }`}>

                {isUnique ? (

                  <Box className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" />

                ) : (

                  <Package className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 dark:text-indigo-400" />

                )}

              </div>

              <div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white break-words">

                  {product.name}

                </h2>

                <div className="flex items-center flex-wrap gap-2 mt-1">

                  {product.category && (

                    <span className="text-xs sm:text-sm text-slate-500">{product.category}</span>

                  )}

                  {isUnique && (

                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">

                      Trackable

                    </span>

                  )}

                </div>

              </div>

            </div>

            <button

              onClick={onClose}

              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors self-start"

            >

              <X className="w-5 h-5" />

            </button>

          </div>



          {/* Quick Stats */}

          <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-5 border-b dark:border-slate-800">

            <div className="text-center">

              <div className={`text-xl sm:text-2xl font-bold ${actualAvailableCount <= 0 ? 'text-red-600' :

                actualAvailableCount <= 5 ? 'text-amber-600' : 'text-emerald-600'

                }`}>

                {actualAvailableCount}

              </div>

              <div className="text-xs text-slate-500">In Stock</div>

            </div>

            <div className="text-center">

              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">

                {actualSoldCount}

              </div>

              <div className="text-xs text-slate-500">Sold</div>

            </div>

            <div className="text-center min-w-0">

              <div className="text-xl sm:text-2xl font-bold text-indigo-600 truncate" title={formatPrice(product.selling_price)}>

                {formatPrice(product.selling_price)}

              </div>

              <div className="text-xs text-slate-500">Price</div>

            </div>

          </div>



          {/* Tab Navigation */}

          <div className="flex gap-1 p-1.5 sm:p-2 mx-3 sm:mx-5 mt-3 bg-slate-100 dark:bg-slate-800 rounded-xl">

            {[

              { id: 'overview', label: 'Overview' },

              { id: 'analytics', label: 'Analytics' },

              { id: 'history', label: 'History' }

            ].map(tab => (

              <button

                key={tab.id}

                onClick={() => setActiveTab(tab.id)}

                className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${activeTab === tab.id

                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'

                  : 'text-slate-600 dark:text-slate-400'

                  }`}

              >

                {tab.label}

              </button>

            ))}

          </div>



          {/* Tab Content */}

          <div className="overflow-y-auto overflow-x-hidden max-h-[50vh] p-3 sm:p-5">

            {activeTab === 'overview' && (

              <div className="space-y-4">

                <div className="grid grid-cols-2 gap-2 sm:gap-3">

                  <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-xl min-w-0 overflow-hidden">

                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">

                      <DollarSign className="w-3.5 h-3.5" />

                      Cost Price

                    </div>

                    <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate" title={formatPrice(product.purchase_price || 0)}>

                      {formatPrice(product.purchase_price || 0)}

                    </div>

                  </div>

                  <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">

                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">

                      <Percent className="w-3.5 h-3.5" />

                      Margin

                    </div>

                    <div className="text-base sm:text-lg font-semibold text-emerald-600">

                      {profitability.margin.toFixed(1)}%

                    </div>

                  </div>

                </div>



                {forecastDays !== null && forecastDays !== Infinity && (

                  <div className={`p-3 sm:p-4 rounded-xl flex items-center gap-3 ${forecastDays <= 7

                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'

                    : forecastDays <= 14

                      ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'

                      : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'

                    }`}>

                    <Clock className={`w-5 h-5 ${forecastDays <= 7 ? 'text-red-600' :

                      forecastDays <= 14 ? 'text-amber-600' : 'text-emerald-600'

                      }`} />

                    <div>

                      <div className="font-medium text-sm sm:text-base text-slate-900 dark:text-white">

                        ~{Math.round(forecastDays)} days of stock remaining

                      </div>

                      <div className="text-xs text-slate-500">Based on 30-day sales average</div>

                    </div>

                  </div>

                )}



                {isUnique && (

                  <div className="space-y-2">

                    <div className="flex items-center justify-between">

                      <h4 className="font-medium text-slate-900 dark:text-white">

                        Tracked IDs ({imeis.length})

                      </h4>

                      {canAdjust && (

                        <button

                          onClick={onEditImeis}

                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"

                        >

                          Manage

                        </button>

                      )}

                    </div>

                    <div className="max-h-32 overflow-y-auto space-y-1">

                      {imeis.length === 0 ? (

                        <p className="text-sm text-slate-500">No IDs tracked</p>

                      ) : (

                        imeis.map((imei, idx) => (

                          <div

                            key={idx}

                            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-mono break-all"

                          >

                            {imei}

                          </div>

                        ))

                      )}

                    </div>

                  </div>

                )}

              </div>

            )}



            {activeTab === 'analytics' && (

              <div className="space-y-6">

                {salesTrends.length > 0 && (

                  <div>

                    <h4 className="font-medium text-slate-900 dark:text-white mb-3">Sales Trend</h4>

                    <div className="h-48 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">

                      <ResponsiveContainer width="100%" height="100%">

                        <LineChart data={salesTrends}>

                          <XAxis

                            dataKey="day"

                            tick={{ fontSize: 10 }}

                            tickFormatter={v => v.slice(5)}

                          />

                          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />

                          <Tooltip

                            contentStyle={{

                              background: '#1e293b',

                              border: 'none',

                              borderRadius: '8px',

                              color: '#fff'

                            }}

                          />

                          <Line

                            type="monotone"

                            dataKey="qty"

                            stroke="#6366f1"

                            strokeWidth={2}

                            dot={false}

                          />

                        </LineChart>

                      </ResponsiveContainer>

                    </div>

                  </div>

                )}



                <div className="grid grid-cols-2 gap-2 sm:gap-3">

                  <div className="p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl min-w-0 overflow-hidden">

                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">

                      Total Revenue

                    </div>

                    <div className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-300 truncate" title={formatPrice(profitability.totalRevenue || 0)}>

                      {formatPrice(profitability.totalRevenue || 0)}

                    </div>

                  </div>

                  <div className="p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl min-w-0 overflow-hidden">

                    <div className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">

                      Total Profit

                    </div>

                    <div className="text-lg sm:text-xl font-bold text-indigo-700 dark:text-indigo-300 truncate" title={formatPrice(profitability.totalProfit || 0)}>

                      {formatPrice(profitability.totalProfit || 0)}

                    </div>

                  </div>

                </div>



                {avgStockLife !== null && (

                  <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">

                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">

                      <Calendar className="w-3.5 h-3.5" />

                      Average Stock Life

                    </div>

                    <div className="text-lg font-semibold text-slate-900 dark:text-white">

                      {Math.round(avgStockLife)} days

                    </div>

                  </div>

                )}

              </div>

            )}



            {activeTab === 'history' && (

              <div className="space-y-3">

                {restockHistory.length === 0 ? (

                  <div className="text-center py-8 text-slate-500">No inventory changes</div>

                ) : (

                  restockHistory.map(log => (

                    <div

                      key={log.id}

                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"

                    >

                      <div>

                        <div className="font-medium text-slate-900 dark:text-white">

                          {log.difference > 0 ? '+' : ''}{log.difference} units

                        </div>

                        <div className="text-xs text-slate-500">

                          {log.reason || (log.difference > 0 ? 'Restock' : 'Reduction')}

                        </div>

                        <div className="text-xs text-slate-400">

                          {log.updated_by_email || 'Unknown'}

                        </div>

                      </div>

                      <div className="text-xs text-slate-400 text-right">

                        {new Date(log.created_at).toLocaleDateString()}

                      </div>

                    </div>

                  ))

                )}

              </div>

            )}

          </div>



          {/* Actions */}

          {canAdjust && (

            <div className="p-3 sm:p-5 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                {!isUnique && (

                  <>

                    <button

                      onClick={onRestock}

                      className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-200 transition-colors"

                    >

                      <Plus className="w-5 h-5" />

                      <span className="text-xs font-medium">Restock</span>

                    </button>

                    <button

                      onClick={onAdjustQty}

                      className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-200 transition-colors"

                    >

                      <RefreshCw className="w-5 h-5" />

                      <span className="text-xs font-medium">Adjust</span>

                    </button>

                    <button

                      onClick={onEdit}

                      className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-200 transition-colors"

                    >

                      <Edit2 className="w-5 h-5" />

                      <span className="text-xs font-medium">Edit</span>

                    </button>

                  </>

                )}

                {canDelete && (

                  <button

                    onClick={onDelete}

                    className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200 transition-colors"

                  >

                    <Trash2 className="w-5 h-5" />

                    <span className="text-xs font-medium">Delete</span>

                  </button>

                )}

              </div>

            </div>

          )}

        </motion.div>

      </motion.div>

    </AnimatePresence>

  );

}

