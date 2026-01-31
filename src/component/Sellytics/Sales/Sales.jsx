
/**
 * SwiftCheckout - Main Tracker Component
 * Production-grade offline-first POS system
 * @version 2.0.0
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, RefreshCw, ShoppingCart, History,
  Wifi, WifiOff, Loader2, Play, Pause
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// Hooks
import useDataLoader from '../hooks/useDataLoader';
import useOfflineSync from '../hooks/useOfflineSync';
import useScanner from './hooks/useScanner';
import useCheckoutState from './hooks/useCheckoutState';
import useCurrency from './hooks/useCurrency';

// Services
import { getIdentity, filterSalesByPermission } from '../services/identityService';
import salesService from './services/salesService';
import offlineCache from '../db/offlineCache';

// ./
import ScannerModal from './ScannerModal';
import CheckoutForm from './CheckoutForm';
import PendingSalesList from './PendingSalesList';
import SalesHistory from './SalesHistory';
//import NotificationsPanel, { NotificationBadge } from './NotificationsPanel';
import ProductPerformanceModal from './ProductPerformanceModal';
import ViewSaleModal from './ViewSaleModal';
import EditSaleModal from './EditSaleModal';

export default function Tracker() {
  const { currentStoreId, currentUserId, isValid } = getIdentity();
  // Data loading
  const {
    products,
    inventory,
    customers,
    sales,
    pendingSales,
    isOwner,
    isLoading,
    refreshData,
    refreshSales,
    refreshInventory,
    getProductByBarcode,
    getInventoryForProduct,
    setPendingSales
  } = useDataLoader();

  // Offline sync
  const {
    isOnline,
    isSyncing,
    syncPaused,
    syncProgress,
    queueCount,
    syncAll,
    pauseSync,
    resumeSync,
    clearQueue,
    updateQueueCount
  } = useOfflineSync(() => {
    refreshSales();
    refreshInventory();
  });

  // Checkout state
  const checkoutState = useCheckoutState();

  // UI State
  const [activeTab, setActiveTab] = useState('checkout');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  //const [showNotifications, setShowNotifications] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewingSale, setViewingSale] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const { formatPrice } = useCurrency();


  // Format price helper

  useEffect(() => {
    const handleSalesChange = () => {
      refreshSales();
    };

    window.addEventListener('salesChanged', handleSalesChange);

    return () => {
      window.removeEventListener('salesChanged', handleSalesChange);
    };
  }, [refreshSales]);

  // Filter sales by permission
  const filteredSales = useMemo(() => {
    const visible = filterSalesByPermission(sales, isOwner);
    if (!search) return visible;

    const lower = search.toLowerCase();
    return visible.filter(s =>
      s.product_name?.toLowerCase().includes(lower) ||
      s.customer_name?.toLowerCase().includes(lower) ||
      s.device_id?.toLowerCase().includes(lower)
    );
  }, [sales, isOwner, search]);

  // Extract all sold IMEIs from current sales data for real-time validation
  const soldImeis = useMemo(() => {
    const set = new Set();
    sales.forEach(sale => {
      // status check just in case, though usually all in dynamic_sales are 'sold' or 'refunded'
      if (sale.status === 'sold' && sale.device_id) {
        sale.device_id.split(',').forEach(id => {
          const tid = id.trim().toLowerCase();
          if (tid) set.add(tid);
        });
      }
    });
    return set;
  }, [sales]);


  // Handle scan success
  const handleScanSuccess = useCallback(async (barcode, targetLineId = null, targetRowKey = null) => {
    const normalizedBarcode = barcode.trim();

    // Check for duplicate in current checkout
    if (checkoutState.hasDuplicateDevice(normalizedBarcode, targetLineId, targetRowKey)) {
      return { success: false, error: `Product ID "${normalizedBarcode}" is already in the cart` };
    }

    // Find product
    let product = getProductByBarcode(normalizedBarcode);

    // Try online if not found locally
    if (!product && isOnline) {
      product = await salesService.getProductByBarcode(normalizedBarcode);
    }

    if (!product) {
      return { success: false, error: `Product not found for: ${normalizedBarcode}` };
    }

    // Check if already sold (check local state first for real-time feel)
    const normalizedLower = normalizedBarcode.toLowerCase();
    const isAlreadySold = soldImeis.has(normalizedLower);

    if (isAlreadySold) {
      const errorMsg = `Device "${normalizedBarcode}" has already been sold`;
      toast.error(errorMsg, { icon: '🚫' });
      return { success: false, error: errorMsg };
    }

    // Check inventory
    const inv = getInventoryForProduct(product.id);
    if (inv) {
      // For unique items, calculate from actual IMEIs minus sold ones
      let stockQty = inv.available_qty;
      if (product.is_unique && product.dynamic_product_imeis) {
        const totalImeis = product.dynamic_product_imeis.split(',').map(i => i.trim().toLowerCase()).filter(Boolean);
        // Only count IMEIs that haven't been sold yet
        const availableImeis = totalImeis.filter(id => !soldImeis.has(id));
        stockQty = availableImeis.length;
      }

      if (stockQty === 0) {
        toast.error('Out of stock — restock needed', { icon: '⚠️' });
      } else if (stockQty <= 6) {
        toast(`Low stock: ${stockQty} left`, { icon: '📦' });
      }
    }

    // Get device size from IMEI mapping
    const deviceImeis = product.dynamic_product_imeis?.split(',').map(i => i.trim()) || [];
    const deviceSizes = product.device_size?.split(',').map(s => s.trim()) || [];
    const deviceIndex = deviceImeis.findIndex(id => id.toLowerCase() === normalizedBarcode.toLowerCase());
    const deviceSize = deviceIndex >= 0 ? deviceSizes[deviceIndex] || '' : '';

    // Apply to checkout state
    checkoutState.applyBarcode(product, normalizedBarcode, deviceSize, targetLineId, targetRowKey);

    // Open checkout form if not open
    if (!showCheckoutForm) {
      setShowCheckoutForm(true);
    }

    return { success: true, productName: product.name };
  }, [isOnline, getProductByBarcode, getInventoryForProduct, checkoutState, showCheckoutForm, soldImeis]);

  // Scanner hook
  const scanner = useScanner(handleScanSuccess);

  // Handle manual Product ID confirmation
  const handleManualDeviceConfirm = useCallback(async (lineId, rowKey, deviceId) => {
    const code = deviceId?.trim();
    if (!code) return;

    const result = await handleScanSuccess(code, lineId, rowKey);

    if (!result.success) {
      // Clear the Product ID field on failure
      checkoutState.updateDeviceRow(lineId, rowKey, { deviceId: '' });

      // If result.error exists and handleScanSuccess didn't already toast it (though it does for 'already sold')
      // we can show it here too for consistency if needed. 
      // handleScanSuccess already toasts for 'already sold'.
    }

    return result;
  }, [handleScanSuccess, checkoutState]);
  // Create sale (fully offline-compatible)

  const createSale = useCallback(async () => {
    const { lines, paymentMethod, selectedCustomerId, selectedCustomerName, emailReceipt, totalAmount } = checkoutState;

    // Validate
    const validLines = lines.filter(l => l.dynamic_product_id && l.quantity > 0);
    if (validLines.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isOnline) {
        // ===================== ONLINE SALE =====================
        const saleGroup = await salesService.createSaleGroup({
          total_amount: totalAmount,
          payment_method: paymentMethod,
          customer_id: selectedCustomerId,
          customer_name: selectedCustomerName,
          email_receipt: emailReceipt
        });

        // 1. Prepare all lines data
        const linesPayload = validLines.map(line => {
          const deviceIds = (line.deviceRows || []).map(r => r.deviceId).filter(Boolean).join(',');
          const deviceSizes = (line.deviceRows || []).map(r => r.deviceSize).filter(Boolean).join(',');

          return {
            dynamic_product_id: line.dynamic_product_id,
            quantity: line.quantity,
            unit_price: line.unit_price,
            payment_method: paymentMethod,
            device_id: deviceIds || undefined,
            device_size: deviceSizes || undefined,
            customer_id: selectedCustomerId || undefined,
            customer_name: selectedCustomerName || undefined,
            sale_group_id: saleGroup.id
          };
        });

        // 2. Bulk insert lines
        await salesService.createSaleLinesBulk(linesPayload);

        // 3. Update inventory (still iterative for now as it's read-modify-write)
        for (const line of validLines) {
          const inv = getInventoryForProduct(line.dynamic_product_id);
          if (inv) {
            await salesService.updateInventoryQty(inv.id, inv.available_qty - line.quantity);
          }
        }

        toast.success('Sale completed successfully!', { icon: '✅' });
        refreshSales();
        refreshInventory();

      } else {
        // ===================== OFFLINE SALE =====================
        const storeId = Number(currentStoreId);
        if (isNaN(storeId)) {
          toast.error('Invalid store configuration. Please reload.');
          return;
        }

        // 1️⃣ Create offline sale group once
        const saleGroup = await offlineCache.createOfflineSaleGroup({
          total_amount: totalAmount,
          payment_method: paymentMethod,
          customer_id: selectedCustomerId || undefined,
          customer_name: selectedCustomerName || undefined,
          email_receipt: emailReceipt,
          created_at: new Date().toISOString()
        }, storeId);

        // 2️⃣ Prepare bulk offline payloads
        const offlinePayloads = validLines.map(line => {
          const sanitizeValue = v => (v === null || v === undefined || v === '' ? undefined : v);
          const deviceIds = (line.deviceRows || []).map(r => sanitizeValue(r.deviceId)).filter(Boolean).join(',');
          const deviceSizes = (line.deviceRows || []).map(r => sanitizeValue(r.deviceSize)).filter(Boolean).join(',');

          const payload = {
            dynamic_product_id: line.dynamic_product_id,
            quantity: line.quantity,
            unit_price: line.unit_price,
            amount: line.quantity * line.unit_price,
            payment_method: paymentMethod,
            client_sale_group_ref: saleGroup._client_ref,
            sold_at: new Date().toISOString()
          };

          if (deviceIds) payload.device_id = deviceIds;
          if (deviceSizes) payload.device_size = deviceSizes;
          if (selectedCustomerId) payload.customer_id = selectedCustomerId;
          if (selectedCustomerName) payload.customer_name = selectedCustomerName;

          return payload;
        });

        // 3️⃣ Bulk create offline sale lines
        await offlineCache.createOfflineSaleLinesBulk(
          offlinePayloads,
          storeId,
          saleGroup._offline_id,
          saleGroup._client_ref
        );

        // 4️⃣ Update cached inventory locally
        const inventoryUpdates = {};
        for (const line of validLines) {
          if (!inventoryUpdates[line.dynamic_product_id]) {
            const inv = getInventoryForProduct(line.dynamic_product_id);
            if (inv) inventoryUpdates[line.dynamic_product_id] = inv.available_qty;
          }
          const newQty = inventoryUpdates[line.dynamic_product_id] - line.quantity;
          await offlineCache.updateCachedInventory(line.dynamic_product_id, storeId, newQty);
          inventoryUpdates[line.dynamic_product_id] = newQty;
        }

        toast.success('Sale saved offline! It will sync when online.', { icon: '✅' });

        // Refresh pending sales and queue count
        const pending = await offlineCache.getPendingSales(storeId);
        setPendingSales(pending);
        updateQueueCount();
      }

      // Reset form
      checkoutState.resetForm();
      setShowCheckoutForm(false);

    } catch (error) {
      console.error('Sale creation error:', error);
      toast.error('Failed to create sale: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }



  }, [
    checkoutState,
    currentStoreId,
    isOnline,
    getInventoryForProduct,
    refreshSales,
    refreshInventory,
    setPendingSales,
    updateQueueCount
  ]);





  // Delete offline sale (only allowed when online)
  // Delete offline sale (allowed online or offline)
  const handleDeleteOfflineSale = useCallback(async (saleId) => {
    // Determine if we should delete from server (if synced) or local only (if pending)
    // The component usually calls this for pending sales, but let's be safe.
    // Logic: If it's a pending sale (not synced), we can delete it offline.

    // Note: The UI (PendingSalesList) calls this. By definition they are pending/offline.

    const success = await offlineCache.deleteOfflineSale(saleId);

    if (success) {
      // Refresh pending sales list
      const pending = await offlineCache.getPendingSales(currentStoreId);
      setPendingSales(pending);

      // Update queue count in sync button
      await updateQueueCount();

      toast.success('Pending sale deleted');
    } else {
      toast.error('Failed to delete sale');
    }

    return success;
  }, [currentStoreId, setPendingSales, updateQueueCount]);







  // Edit pending sale
  const handleEditPendingSale = useCallback((sale) => {
    checkoutState.loadFromSale(sale);
    setEditingSale(sale);
    setShowCheckoutForm(true);
  }, [checkoutState]);

  // Delete synced sale
  const handleDeleteSale = useCallback(async (saleId) => {
    const success = await salesService.deleteSale(saleId);
    if (success) {
      refreshSales();
    }
    return success;
  }, [refreshSales]);

  // View product performance
  const handleViewProduct = useCallback((sale) => {
    const product = products.find(p => p.id === sale.dynamic_product_id);
    setSelectedProduct(product || {
      id: sale.dynamic_product_id,
      name: sale.product_name
    });
  }, [products]);

  // Edit synced sale
  const handleEditSyncedSale = useCallback((sale) => {
    setEditingSale(sale);
  }, []);

  // Save edited sale
  const handleSaveEditedSale = useCallback(async (editedData) => {
    if (!editingSale) return;

    const success = await salesService.updateSale(editingSale.id, editedData);
    if (success) {
      toast.success('Sale updated');
      refreshSales();
      setEditingSale(null);
    } else {
      toast.error('Failed to update sale');
    }
  }, [editingSale, refreshSales]);

  // Loading state
  if (!isValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Configuration Required
          </h2>
          <p className="text-slate-500">
            Please ensure store_id is set in localStorage
          </p>
        </div>
        <toast position="top-right" autoClose={3000} />
      </div>
    );
  }

  if (isLoading && sales.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="mt-4 text-slate-500">Loading checkout...</p>
        <toast position="top-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">


        <div className="w-full flex-shrink-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          {/* Header Top - Connection Status & Sync */}
          <div className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 min-h-[44px] sm:min-h-auto">
            {/* Connection Status */}
            <div className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs sm:text-xs font-medium flex-shrink-0 ${isOnline
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
              {isOnline ? <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <WifiOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              <span className="hidden xs:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Pending Sync Button - Full Width on Mobile */}
            {queueCount > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none">
                <button
                  onClick={syncAll}
                  disabled={!isOnline || isSyncing}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg sm:rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-95 min-h-[40px] sm:min-h-auto"
                >
                  <RefreshCw className={`w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="truncate">Sync ({queueCount})</span>
                </button>

                {isSyncing && (
                  <button
                    onClick={syncPaused ? resumeSync : pauseSync}
                    className="p-2 sm:p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors active:scale-95 min-h-[40px] min-w-[40px] sm:min-h-auto sm:min-w-auto flex items-center justify-center"
                    aria-label={syncPaused ? 'Resume sync' : 'Pause sync'}
                  >
                    {syncPaused ? <Play className="w-4 h-4 sm:w-4 sm:h-4" /> : <Pause className="w-4 h-4 sm:w-4 sm:h-4" />}
                  </button>
                )}
              </div>
            )}

            {/* New Sale Button - High Priority CTA */}
            <button
              onClick={() => setShowCheckoutForm(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 text-sm sm:text-base"
            >
              <Plus className="w-4.5 h-4.5 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="truncate">New Sale</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation - Native Mobile App Style */}
        <div className="w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 sticky top-0 z-10">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('checkout')}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold transition-all active:scale-95 min-h-[48px] sm:min-h-auto border-b-2 ${activeTab === 'checkout'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-300'
                }`}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="truncate">Checkout</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold transition-all active:scale-95 min-h-[48px] sm:min-h-auto border-b-2 ${activeTab === 'history'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-300'
                }`}
            >
              <History className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="truncate">History</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-full mx-0 flex-1 flex flex-col space-y-0">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Checkout Tab - With Padding */}
            {activeTab === 'checkout' && (
              <div className="px-3 sm:px-4 md:px-5 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
                {/* Quick Actions - Native Mobile Style */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <button
                    onClick={() => scanner.openScanner('camera')}
                    className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 md:p-5 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-600 active:scale-95 transition-all group touch-manipulation min-h-[120px] sm:min-h-[140px]"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center group-hover:scale-110 group-active:scale-100 transition-transform flex-shrink-0">
                      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm text-center">Quick Scan</span>
                    <span className="text-xs sm:text-xs text-slate-500 dark:text-slate-400 text-center line-clamp-1">Camera</span>
                  </button>

                  <button
                    onClick={refreshData}
                    className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 md:p-5 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:shadow-md dark:hover:border-emerald-600 active:scale-95 transition-all group touch-manipulation min-h-[120px] sm:min-h-[140px]"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center group-hover:scale-110 group-active:scale-100 transition-transform flex-shrink-0">
                      <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm text-center">Refresh</span>
                    <span className="text-xs sm:text-xs text-slate-500 dark:text-slate-400 text-center line-clamp-1">Data</span>
                  </button>
                </div>

                {/* Pending Sales */}
                <PendingSalesList
                  pendingSales={pendingSales}
                  isOnline={isOnline}
                  isSyncing={isSyncing}
                  syncPaused={syncPaused}
                  syncProgress={syncProgress}
                  onSync={syncAll}
                  onPauseSync={syncPaused ? resumeSync : pauseSync}
                  onClearQueue={async () => {
                    await clearQueue();
                    setPendingSales([]); // Force immediate UI clear
                  }}
                  onEditSale={handleEditPendingSale}
                  onDeleteSale={handleDeleteOfflineSale}
                  formatPrice={formatPrice}
                />
              </div>
            )}

            {/* History Tab - Full Width, No Padding */}
            {activeTab === 'history' && (
              <SalesHistory
                sales={filteredSales}
                isOnline={isOnline}
                isOwner={isOwner}
                currentUserId={currentUserId}
                onViewSale={setViewingSale}
                onViewProduct={handleViewProduct}
                onEditSale={handleEditSyncedSale}
                onDeleteSale={handleDeleteSale}
                formatPrice={formatPrice}
                search={search}
                setSearch={setSearch}
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter}
              />
            )}
          </div>
        </div>
      </div>

      {/* Checkout Form Modal */}
      <AnimatePresence>
        {showCheckoutForm && (
          <CheckoutForm
            lines={checkoutState.lines}
            products={products}
            inventory={inventory}
            customers={customers}
            paymentMethod={checkoutState.paymentMethod}
            selectedCustomerId={checkoutState.selectedCustomerId}
            emailReceipt={checkoutState.emailReceipt}
            totalAmount={checkoutState.totalAmount}
            isOnline={isOnline}
            isSubmitting={isSubmitting}
            soldImeis={soldImeis}
            onProductChange={(lineId, productId) => {
              const product = products.find(p => p.id === productId);
              if (product) {
                checkoutState.setLineProduct(lineId, product);
              }
            }}
            onQuantityChange={(lineId, qty) => checkoutState.updateLine(lineId, {
              quantity: qty,
              isQuantityManual: true
            })}
            onPriceChange={(lineId, price) => checkoutState.updateLine(lineId, { unit_price: price })}
            onAddDeviceRow={checkoutState.addDeviceRow}
            onUpdateDeviceRow={checkoutState.updateDeviceRow}
            onRemoveDeviceRow={checkoutState.removeDeviceRow}
            onConfirmDeviceRow={handleManualDeviceConfirm}
            onAddLine={checkoutState.addLine}
            onRemoveLine={checkoutState.removeLine}
            onPaymentMethodChange={checkoutState.setPaymentMethod}
            onCustomerChange={(customerId) => {
              const customer = customers.find(c => c.id === customerId);
              checkoutState.setSelectedCustomerId(customerId);
              checkoutState.setSelectedCustomerName(customer?.fullname || '');
            }}
            onEmailReceiptChange={checkoutState.setEmailReceipt}
            onOpenScanner={(lineId) => {
              checkoutState.openScanner(lineId);
              scanner.openScanner('camera', lineId);
            }}
            onSubmit={async () => {
              // 1. If we are editing an offline sale, delete the old one first, then create new
              //    (This is simpler than "updating" for now, ensuring ID regeneration and clean state)
              //    OR handle "update" explicitly. Given standard POS logic, voiding (deleting) and re-ringing is safe.
              //    However, user requested "Update".

              if (editingSale && !editingSale._synced) {
                // Deleting the old pending sale
                await offlineCache.deleteOfflineSale(editingSale.id || editingSale._offline_id);
                // Proceed to create new sale (createSale will handle it)
              }

              await createSale();

              // Clear editing state
              setEditingSale(null);
            }}
            onCancel={() => {
              setShowCheckoutForm(false);
              setEditingSale(null);
              checkoutState.resetForm();
            }}
            formatPrice={formatPrice}
            isEditing={!!editingSale}
          />
        )}
      </AnimatePresence>

      {/* Scanner Modal */}
      <ScannerModal
        show={scanner.showScanner}
        scannerMode={scanner.scannerMode}
        setScannerMode={scanner.setScannerMode}
        continuousScan={scanner.continuousScan}
        setContinuousScan={scanner.setContinuousScan}
        manualInput={scanner.manualInput}
        setManualInput={scanner.setManualInput}
        onManualSubmit={scanner.handleManualSubmit}
        processScannedCode={scanner.processScannedCode}
        onClose={scanner.closeScanner}
      />



      {/* Product Performance Modal */}
      {selectedProduct && (
        <ProductPerformanceModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          formatPrice={formatPrice}
        />
      )}

      {/* View Sale Modal */}
      {viewingSale && (
        <ViewSaleModal
          sale={viewingSale}
          onClose={() => setViewingSale(null)}
          formatPrice={formatPrice}
        />
      )}

      {/* Edit Sale Modal */}
      {editingSale && !showCheckoutForm && (
        <EditSaleModal
          sale={editingSale}
          products={products}
          customers={customers}
          isOwner={isOwner}
          isOnline={isOnline}
          currentUserId={currentUserId}
          onSave={handleSaveEditedSale}
          onClose={() => setEditingSale(null)}
          formatPrice={formatPrice}
        />
      )}
    </>
  );
}
