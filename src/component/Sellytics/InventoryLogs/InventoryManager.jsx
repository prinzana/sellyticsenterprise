import React, { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { Package, Search, RefreshCw, Wifi, WifiOff, Bell, Filter, History, BarChart3, Scan, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

import useInventoryData from './hooks/useInventoryData';
import useOfflineSync from './hooks/useOfflineSync';
import useScanner from './hooks/useScanner';
import useInventorySearch from './hooks/useInventorySearch';
import usePagination from './hooks/usePagination';
import useLowStock from './hooks/useLowStock';
import useNotifications from './hooks/useNotifications';

import InventoryCard from './InventoryCard';
import ProductDetailSheet from './ProductDetailSheet';
import ScannerModal from './ScannerModal';
import RestockModal from './RestockModal';
import AdjustQuantityModal from './AdjustQuantityModal';
import EditProductModal from './EditProductModal';
import ImeiEditorModal from './ImeiEditorModal';
import HistoryPage from './HistoryPage';
import EvaluationPage from './EvaluationPage';
import HistoryPage from './HistoryPage';
import EvaluationPage from './EvaluationPage';
import NotificationPanel from './NotificationPanel';
import BulkRestockModal from './BulkRestockModal';
import SearchInput from '../ui/SearchInput';

import inventoryService from './services/inventoryService';

export default function InventoryManager() {
  const {
    storeId,
    userEmail,
    inventory,
    loading,
    isOnline,
    canAdjust,
    canDelete,
    fetchInventory,
    getProductByBarcode
  } = useInventoryData();

  const {
    pendingCount,
    isSyncing,

    syncAll,

    queueInventoryUpdate,
    queueImeiUpdate,
    queueAdjustment
  } = useOfflineSync(storeId, userEmail, fetchInventory);

  const {
    searchTerm,
    setSearchTerm,
    stockFilter,
    setStockFilter,
    filteredInventory,
  } = useInventorySearch(inventory);

  const {
    page,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    resetPage
  } = usePagination(filteredInventory, 20);

  const lowStockItems = useLowStock(inventory, 5);

  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll
  } = useNotifications(storeId);

  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockItem, setRestockItem] = useState(null);
  const [showBulkRestock, setShowBulkRestock] = useState(false);
  const [adjustItem, setAdjustItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [imeiItem, setImeiItem] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = useCallback((value) => {
    return `${(value || 0).toLocaleString()}`;
  }, []);

  const handleScanSuccess = useCallback(async (barcode) => {
    const product = await getProductByBarcode(barcode);
    if (!product) {
      return { success: false, error: `Product not found: ${barcode}` };
    }

    const item = inventory.find(i => i.dynamic_product_id === product.id);
    if (item) {
      setSelectedItem(item);
      return { success: true, productName: product.name };
    }

    return { success: false, error: 'Product not in inventory' };
  }, [getProductByBarcode, inventory]);

  const scanner = useScanner(handleScanSuccess);

  const handleRestock = useCallback(async (data) => {
    setIsSubmitting(true);
    try {
      if (isOnline) {
        if (data.isUnique && data.imeis?.length) {
          for (const imei of data.imeis) {
            await inventoryService.addImei(data.productId, imei, storeId, userEmail);
          }
        } else {
          await inventoryService.restockProduct(data.productId, storeId, data.quantity, data.reason, userEmail);
        }
        toast.success(`Added ${data.quantity} units to stock`);
        await addNotification('restock', `Restocked ${data.quantity} units`);
      } else {
        await queueInventoryUpdate(data.productId, 'restock', {
          quantity: data.quantity,
          reason: data.reason
        });
        toast.success('Restock queued for sync');
      }

      await fetchInventory();
      setRestockItem(null);
      setSelectedItem(null);
    } catch (err) {
      toast.error(err.message || 'Failed to restock');
    }
    setIsSubmitting(false);
  }, [isOnline, storeId, userEmail, fetchInventory, queueInventoryUpdate, addNotification]);

  const handleBulkRestock = useCallback(async (items) => {
    setIsSubmitting(true);
    try {
      if (isOnline) {
        // Use the new bulk service
        const result = await inventoryService.restockProductsBulk(items, storeId, userEmail);

        if (result.failed.length === 0) {
          toast.success(`Successfully restocked ${result.successful.length} products`);
          await addNotification('restock', `Bulk restock: ${result.successful.length} items`);
        } else {
          toast.error(`Partially successful. ${result.failed.length} items failed.`);
          // Ideally we would keep the failed ones open in the modal, but for now we close
        }
      } else {
        // Offline Mode: Queue individually (fallback for V1)
        for (const item of items) {
          await queueInventoryUpdate(item.productId, 'restock', {
            quantity: item.quantity,
            reason: item.reason
          });
        }
        toast.success(`Restock for ${items.length} items queued for sync`);
      }

      await fetchInventory();
      setShowBulkRestock(false);
    } catch (err) {
      toast.error(err.message || 'Failed to process bulk restock');
      console.error(err);
    }
    setIsSubmitting(false);
  }, [isOnline, storeId, userEmail, fetchInventory, queueInventoryUpdate, addNotification]);

  const handleAdjustStock = useCallback(async (inventoryId, difference, reason) => {
    setIsSubmitting(true);
    try {
      if (isOnline) {
        await inventoryService.adjustStock(inventoryId, difference, reason, userEmail);
        toast.success(`Stock adjusted by ${difference} units`);
        await addNotification('adjust', `Adjusted stock by ${difference} units: ${reason}`);
      } else {
        await queueAdjustment(inventoryId, difference, reason);
        toast.success('Adjustment queued for sync');
      }

      await fetchInventory();
      setAdjustItem(null);
      setSelectedItem(null);
    } catch (err) {
      toast.error(err.message || 'Failed to adjust stock');
    }
    setIsSubmitting(false);
  }, [isOnline, userEmail, fetchInventory, queueAdjustment, addNotification]);

  const handleEditProduct = useCallback(async (productId, updates) => {
    setIsSubmitting(true);
    try {
      if (isOnline) {
        await inventoryService.updateProduct(productId, updates);
        toast.success('Product updated');
      } else {
        await queueInventoryUpdate(productId, 'update', updates);
        toast.success('Update queued for sync');
      }

      await fetchInventory();
      setEditItem(null);
      setSelectedItem(null);
    } catch (err) {
      toast.error(err.message || 'Failed to update product');
    }
    setIsSubmitting(false);
  }, [isOnline, fetchInventory, queueInventoryUpdate]);

  const handleDeleteProduct = useCallback(async () => {
    if (!selectedItem) return;

    const confirmed = window.confirm('Are you sure you want to delete this product? This cannot be undone.');
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await inventoryService.deleteProduct(selectedItem.dynamic_product_id);
      toast.success('Product deleted');
      await fetchInventory();
      setSelectedItem(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    }
    setIsSubmitting(false);
  }, [selectedItem, fetchInventory]);

  const handleAddImei = useCallback(async (productId, imei) => {
    try {
      if (isOnline) {
        await inventoryService.addImei(productId, imei, storeId, userEmail);
      } else {
        await queueImeiUpdate(productId, 'add', imei);
      }
      await fetchInventory();
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to add IMEI');
      return false;
    }
  }, [isOnline, storeId, userEmail, fetchInventory, queueImeiUpdate]);

  const handleRemoveImei = useCallback(async (productId, imei) => {
    try {
      if (isOnline) {
        await inventoryService.removeImei(productId, imei, storeId, userEmail);
      } else {
        await queueImeiUpdate(productId, 'remove', imei);
      }
      await fetchInventory();
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to remove IMEI');
      return false;
    }
  }, [isOnline, storeId, userEmail, fetchInventory, queueImeiUpdate]);

  if (loading && inventory.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
        <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-indigo-600" />
        <p className="mt-4 text-sm sm:text-base text-slate-500">Loading inventory...</p>
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 space-y-3 sm:space-y-0">
          {/* Title and Status Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                Inventory
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {inventory.length} • {lowStockItems.length} low
              </p>
            </div>

            {/* Status & Actions Row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              <div className={`flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-xs font-medium flex-shrink-0 ${isOnline ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span className="hidden xs:inline text-xs">{isOnline ? 'Online' : 'Offline'}</span>
              </div>

              {pendingCount > 0 && (
                <button
                  onClick={syncAll}
                  disabled={!isOnline || isSyncing}
                  className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg text-xs font-medium transition-all active:scale-95 min-h-[32px] sm:min-h-auto flex-shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden xs:inline text-xs">Sync</span>
                  <span className="text-xs font-bold">({pendingCount})</span>
                </button>
              )}

              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center flex-shrink-0"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </button>

              <button
                onClick={() => scanner.openScanner('camera')}
                className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-95 min-h-[40px] flex-shrink-0"
              >
                <Scan className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden xs:inline">Scan</span>
              </button>

              <button
                onClick={() => setShowBulkRestock(true)}
                className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-95 min-h-[40px] flex-shrink-0"
              >
                <Package className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden xs:inline">Bulk</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-0 sm:px-0 py-4 sm:py-6 space-y-3 sm:space-y-4">

          {/* Tabs - Full Width Sticky */}
          <div className="flex gap-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar px-3 sm:px-4 md:px-6 sticky top-0 z-10">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-2.5 sm:py-3 text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all border-b-2 min-h-[40px] sm:min-h-auto active:scale-95 ${activeTab === 'inventory'
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-300'
                }`}
            >
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Inventory</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-2.5 sm:py-3 text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all border-b-2 min-h-[40px] sm:min-h-auto active:scale-95 ${activeTab === 'history'
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-300'
                }`}
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>History</span>
            </button>

            <button
              onClick={() => setActiveTab('evaluation')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-2.5 sm:py-3 text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all border-b-2 min-h-[40px] sm:min-h-auto active:scale-95 ${activeTab === 'evaluation'
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-300'
                }`}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Evaluation</span>
            </button>
          </div>

          {activeTab === 'inventory' && (
            <div className="space-y-2 sm:space-y-3">
              {/* Search & Filter Section */}
              <div className="space-y-1.5 sm:space-y-2 px-3 sm:px-4 md:px-6">
                {/* Search Input */}
                <SearchInput
                  value={searchTerm}
                  onChange={(val) => { setSearchTerm(val); resetPage(); }}
                  placeholder="Search products..."
                  className="py-2.5 sm:py-2.5"
                />

                {/* Stock Filters */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                  <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0" />
                  {['all', 'in', 'low', 'out'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => { setStockFilter(filter); resetPage(); }}
                      className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-xs font-medium whitespace-nowrap transition-all active:scale-95 flex-shrink-0 ${stockFilter === filter
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                    >
                      {filter === 'all' ? 'All' : filter === 'in' ? 'In' : filter === 'low' ? 'Low' : 'Out'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products List */}
              <div className="space-y-1.5 sm:space-y-2 px-3 sm:px-4 md:px-6">
                <AnimatePresence mode="popLayout">
                  {paginatedItems.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-8 text-center">
                      <Package className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs text-slate-500">No products</p>
                    </div>
                  ) : (
                    paginatedItems.map(item => (
                      <InventoryCard
                        key={item.id}
                        item={item}
                        onClick={() => setSelectedItem(item)}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-2 sm:pt-4 px-3 sm:px-4 md:px-6">
                  <button
                    onClick={prevPage}
                    disabled={page === 1}
                    className="p-1.5 sm:p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 min-h-[32px] min-w-[32px] flex items-center justify-center"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium min-w-fit">
                    {page}/{totalPages}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={page === totalPages}
                    className="p-1.5 sm:p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 min-h-[32px] min-w-[32px] flex items-center justify-center"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && <HistoryPage storeId={storeId} />}
          {activeTab === 'evaluation' && <EvaluationPage inventory={inventory} formatPrice={formatPrice} />}
        </div>
      </div>

      {selectedItem && (
        <ProductDetailSheet
          item={selectedItem}
          canAdjust={canAdjust}
          canDelete={canDelete}
          onClose={() => setSelectedItem(null)}
          onEdit={() => { setEditItem(selectedItem); setSelectedItem(null); }}
          onRestock={() => { setRestockItem(selectedItem); setSelectedItem(null); }}
          onAdjustQty={() => { setAdjustItem(selectedItem); setSelectedItem(null); }}
          onEditImeis={() => { setImeiItem(selectedItem); setSelectedItem(null); }}
          onDelete={handleDeleteProduct}
        />
      )}

      {restockItem && (
        <RestockModal
          item={restockItem}
          onRestock={handleRestock}
          onClose={() => setRestockItem(null)}
          onScan={(callback) => scanner.openScanner('external')}
          isSubmitting={isSubmitting}
        />
      )}

      {adjustItem && (
        <AdjustQuantityModal
          item={adjustItem}
          onClose={() => setAdjustItem(null)}
          onAdjust={handleAdjustStock}
          isSubmitting={isSubmitting}
        />
      )}

      {editItem && (
        <EditProductModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSubmit={handleEditProduct}
          isSubmitting={isSubmitting}
        />
      )}

      {imeiItem && (
        <ImeiEditorModal
          item={imeiItem}
          onClose={() => setImeiItem(null)}
          onAddImei={handleAddImei}
          onRemoveImei={handleRemoveImei}
          isSubmitting={isSubmitting}
          openScanner={scanner.openScanner}
        />
      )}

      <ScannerModal
        show={scanner.showScanner}
        scannerMode={scanner.scannerMode}
        setScannerMode={scanner.setScannerMode}
        continuousScan={scanner.continuousScan}
        setContinuousScan={scanner.setContinuousScan}
        isLoading={scanner.isLoading}
        error={scanner.error}
        videoRef={scanner.videoRef}
        manualInput={scanner.manualInput}
        setManualInput={scanner.setManualInput}
        onManualSubmit={scanner.handleManualSubmit}
        onClose={scanner.closeScanner}
      />

      {showBulkRestock && (
        <BulkRestockModal
          products={inventory} // Pass prompt inventory list for searching
          onClose={() => setShowBulkRestock(false)}
          onSubmit={handleBulkRestock}
          isSubmitting={isSubmitting}
          onScanClick={() => scanner.openScanner('external')}
        />
      )}

      <NotificationPanel
        show={showNotifications}
        notifications={notifications}
        onClose={() => setShowNotifications(false)}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onClear={clearAll}
      />
    </div>
  );
}