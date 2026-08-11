// NewTransferView.jsx - Updated with Warehouse Client Selection
import React from "react";
import { Package, Search, ArrowRight, Plus, Minus, Trash2, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function NewTransferView({
  userWarehouses,
  sourceWarehouseId,
  setSourceWarehouseId,
  warehouseClients,         // NEW: clients for selected warehouse
  sourceClientId,           // NEW
  setSourceClientId,        // NEW
  userStores,
  destinationStoreId,
  setDestinationStoreId,
  filteredProducts,
  loading,
  selectedItems,
  totalItems,
  searchQuery,
  setSearchQuery,
  addToTransfer,
  updateQuantity,
  removeFromTransfer,
  setShowConfirmModal,
}) {
  return (
    <div className="grid lg:grid-cols-3 gap-2 sm:gap-3">
      {/* Available Products - Compact */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-2.5 sm:p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-sm sm:text-base font-semibold flex items-center gap-1.5 sm:gap-2 text-slate-900 dark:text-white">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
              Available Inventory
            </h3>
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="p-2.5 sm:p-3 max-h-80 sm:max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8 sm:py-10">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-indigo-600" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              {sourceClientId
                ? "No products in stock"
                : sourceWarehouseId
                  ? "Select a client"
                  : "Select a warehouse"}
            </div>
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              {filteredProducts.map((item) => {
                const p = item.warehouse_product_id;
                const selected = selectedItems.find((i) => i.productId === p.id);

                return (
                  <motion.div
                    key={item.id}
                    onClick={() => addToTransfer(item)}
                    className={`p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition ${selected
                        ? "border-indigo-300 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{p.product_name}</h4>
                        <div className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {p.sku && `${p.sku} • `}
                          {p.product_type}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{item.available_qty}</p>
                        <p className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400">avail.</p>
                        {selected && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-indigo-600 text-white text-[9px] sm:text-xs rounded-full">
                            {selected.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Transfer Cart - Compact */}
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-2.5 sm:p-3 bg-indigo-900 text-white rounded-t-lg sm:rounded-t-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-sm sm:text-base font-semibold flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              Transfer Cart
            </h3>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs sm:text-sm">
              {totalItems}
            </span>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 space-y-2 sm:space-y-2.5">
          {/* Source Warehouse */}
          <div>
            <label className="block text-[10px] sm:text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">Source Warehouse</label>
            <select
              value={sourceWarehouseId}
              onChange={(e) => {
                setSourceWarehouseId(e.target.value);
                setSourceClientId("");
              }}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select...</option>
              {(userWarehouses ?? []).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Source Client */}
          <div>
            <label className="block text-[10px] sm:text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">Source Client</label>
            <select
              value={sourceClientId}
              onChange={(e) => setSourceClientId(e.target.value)}
              disabled={!sourceWarehouseId}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:dark:bg-slate-800/50 disabled:cursor-not-allowed"
            >
              <option value="">
                {sourceWarehouseId ? "Select..." : "Select warehouse first"}
              </option>
              {(warehouseClients ?? []).map((client) => (
                <option key={client.id} value={client.id}>
                  {client.client_name}
                  {client.business_name && ` (${client.business_name})`}
                  {client.client_type === "EXTERNAL" && " [Ext]"}
                  {client.client_type === "SELLYTICS_STORE" && " [Store]"}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Store */}
          <div>
            <label className="block text-[10px] sm:text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">Destination Store</label>
            <select
              value={destinationStoreId}
              onChange={(e) => setDestinationStoreId(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select...</option>
              {(userStores ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shop_name}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Items */}
          <div className="space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-64 overflow-y-auto border-t border-slate-100 dark:border-slate-800 pt-2">
            {selectedItems.length === 0 ? (
              <p className="text-center text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 py-6">
                Click products to add
              </p>
            ) : (
              selectedItems.map((item) => (
                <div key={item.productId} className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] sm:text-xs font-medium truncate pr-2 leading-tight flex-1 text-slate-900 dark:text-slate-200">
                      {item.productName}
                    </span>
                    <button onClick={() => removeFromTransfer(item.productId)}>
                      <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 hover:text-rose-700 flex-shrink-0" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[9px] sm:text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Max: {item.maxQuantity}</span>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        disabled={item.quantity <= 1}
                        className="w-5 h-5 sm:w-6 sm:h-6 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded flex items-center justify-center disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                      <span className="w-6 sm:w-8 text-center font-semibold text-[10px] sm:text-xs text-slate-900 dark:text-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        disabled={item.quantity >= item.maxQuantity}
                        className="w-5 h-5 sm:w-6 sm:h-6 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded flex items-center justify-center disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Transfer Button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={
              !sourceWarehouseId ||
              !sourceClientId ||
              !destinationStoreId ||
              selectedItems.length === 0
            }
            className="w-full py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:dark:bg-slate-800 disabled:dark:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition text-xs sm:text-sm font-medium"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Transfer {totalItems} Item{totalItems !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}