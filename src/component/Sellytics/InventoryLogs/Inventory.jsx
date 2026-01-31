
import React, { useState, useCallback, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import {
  Package, Search, RefreshCw, Wifi, WifiOff, Bell,
  Filter, History, BarChart3, Scan, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';

// Hooks
import useInventoryData from './hooks/useInventoryData';
import useOfflineSync from './hooks/useOfflineSync';
import useScanner from './hooks/useScanner';
import useInventorySearch from './hooks/useInventorySearch';
import usePagination from './hooks/usePagination';
import useLowStock from './hooks/useLowStock';
import useNotifications from './hooks/useNotifications';

// Components
import InventoryCard from './InventoryCard';
import ProductDetailSheet from './ProductDetailSheet';
import ScannerModal from './ScannerModal';
import RestockModal from './RestockModal';
import AdjustQuantityModal from './AdjustQuantityModal';
import EditProductModal from './EditProductModal';
import ImeiEditorModal from './ImeiEditorModal';
import HistoryPage from './HistoryPage';
import EvaluationPage from './EvaluationPage';
import NotificationPanel from './NotificationPanel';
import BulkRestockModal from './BulkRestockModal'; // NEW Import

// Services
import inventoryService from './services/inventoryServices';


export default function Inventory() {
  // Core data
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

  // Offline sync
  const {
    pendingCount,
    isSyncing,
    syncAll,
    queueInventoryUpdate,
    queueImeiUpdate,
    queueAdjustment
  } = useOfflineSync(storeId, userEmail, fetchInventory);

  // Search and filter
  const {
    searchTerm,
    setSearchTerm,
    stockFilter,
    setStockFilter,
    filteredInventory,
  } = useInventorySearch(inventory);

  // Pagination
  const {
    page,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    resetPage
  } = usePagination(filteredInventory, 20);

  // Low stock
  const lowStockItems = useLowStock(inventory, 5);

  // Notifications
  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll
  } = useNotifications(storeId);

  // UI State
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'history' | 'evaluation'
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockItem, setRestockItem] = useState(null);
  const [showBulkRestock, setShowBulkRestock] = useState(false); // NEW State
  const [adjustItem, setAdjustItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [imeiItem, setImeiItem] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [soldImeis, setSoldImeis] = useState(new Set());

  // Fetch sold IMEIs for accurate unique item stock counts
  useEffect(() => {
    if (!storeId) return;

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
  }, [storeId, inventory]); // Re-fetch when inventory changes

  // Currency formatter
  const formatPrice = useCallback((value) => {
    return `₦${(value || 0).toLocaleString()}`;
  }, []);

  // Handle scan success
  const handleScanSuccess = useCallback(async (barcode) => {
    const product = getProductByBarcode(barcode);
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

  // Handle restock (Single)
  const handleRestock = useCallback(async (data) => {
    setIsSubmitting(true);
    try {
      if (isOnline) {
        if (data.isUnique && data.imeis?.length) {
          // Add IMEIs for unique products
          for (const imei of data.imeis) {
            await inventoryService.addImei(data.productId, imei, storeId, userEmail);
          }
        } else {
          await inventoryService.restockProduct(
            data.productId,
            storeId,
            data.quantity,
            data.reason,
            userEmail
          );
        }
        toast.success(`Added ${data.quantity} units to stock`);
        await addNotification('restock', `Restocked ${data.quantity} units`);
      } else {
        // Queue for offline
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

  // NEW: Bulk Restock Handler
  const handleBulkRestock = useCallback(async (items) => {
    setIsSubmitting(true);
    try {
      if (isOnline) {
        const result = await inventoryService.restockProductsBulk(items, storeId, userEmail);

        if (result.failed.length === 0) {
          toast.success(`Successfully restocked ${result.successful.length} products`);
          await addNotification('restock', `Bulk restock: ${result.successful.length} items`);
        } else {
          toast.error(`Partially successful. ${result.failed.length} items failed.`);
        }
      } else {
        // Offline Mode
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


  // Handle adjust stock
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

  // Handle edit product
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

  // Handle delete product
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

  // Handle add IMEI
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

  // Handle remove IMEI
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

  // Loading state
  if (loading && inventory.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="mt-4 text-slate-500">Loading inventory...</p>
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <p className="text-sm text-slate-500 mt-1">
              {inventory.length} products • {lowStockItems.length} low stock
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Connection Status */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${isOnline
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
                }`}
            >
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" />
              )}
              {isOnline ? 'Online' : 'Offline'}
            </div>

            {/* Pending Sync */}
            {pendingCount > 0 && (
              <button
                onClick={syncAll}
                disabled={!isOnline || isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
                />
                Sync ({pendingCount})
              </button>
            )}

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </div>
              )}
            </button>

            {/* Bulk Restock Button (NEW) */}
            <button
              onClick={() => setShowBulkRestock(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white border border-transparent rounded-xl font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk</span>
            </button>

            {/* Scan */}
            <button
              onClick={() => scanner.openScanner('camera')}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">Scan</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="
        flex gap-1 p-1
        bg-slate-100 dark:bg-slate-800
        rounded-xl
        overflow-x-auto
        sm:overflow-visible
        no-scrollbar
      "
        >
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 min-w-[120px] sm:min-w-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'inventory'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            <Package className="w-4 h-4" />
            Inventory
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 min-w-[120px] sm:min-w-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'history'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            <History className="w-4 h-4" />
            History
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            className={`flex-1 min-w-[120px] sm:min-w-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'evaluation'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            <BarChart3 className="w-4 h-4" />
            Evaluation
          </button>
        </div>

        {/* Content */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 py-2 space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
                  placeholder="Search products, barcodes, IMEIs..."
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                {['all', 'in', 'low', 'out'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => { setStockFilter(filter); resetPage(); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${stockFilter === filter
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                  >
                    {filter === 'all' ? 'All' : filter === 'in' ? 'In Stock' : filter === 'low' ? 'Low Stock' : 'Out of Stock'}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory List */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {paginatedItems.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500">No products found</p>
                  </div>
                ) : (
                  paginatedItems.map(item => (
                    <InventoryCard
                      key={item.id}
                      item={item}
                      onClick={() => setSelectedItem(item)}
                      formatPrice={formatPrice}
                      soldImeis={soldImeis}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={prevPage}
                  disabled={page === 1}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={page === totalPages}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <HistoryPage storeId={storeId} />
        )}

        {activeTab === 'evaluation' && (
          <EvaluationPage inventory={inventory} formatPrice={formatPrice} />
        )}
      </div>

      {/* Modals */}
      {selectedItem && (
        <ProductDetailSheet
          item={selectedItem}
          storeId={storeId}
          canAdjust={canAdjust}
          canDelete={canDelete}
          onClose={() => setSelectedItem(null)}
          onEdit={() => { setEditItem(selectedItem); setSelectedItem(null); }}
          onRestock={() => { setRestockItem(selectedItem); setSelectedItem(null); }}
          onAdjustQty={() => { setAdjustItem(selectedItem); setSelectedItem(null); }}
          onEditImeis={() => { setImeiItem(selectedItem); setSelectedItem(null); }}
          onDelete={handleDeleteProduct}
          formatPrice={formatPrice}
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

      {/* NEW: Bulk Restock Modal */}
      {showBulkRestock && (
        <BulkRestockModal
          products={inventory}
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