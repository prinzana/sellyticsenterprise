/**
 * Product Catalogue - Offline-First Enterprise App
 * Complete CRUD with seamless sync, notifications, and mobile-responsive UI
 */
import React, { useState } from 'react';
import {
  Plus, RefreshCw, Wifi, WifiOff, Loader2, Package,
  Search, Filter, Upload, X, AlertCircle
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../../../supabaseClient';
import CurrencySelector from './CurrencySelector';
// Components
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';
import ProductDetailModal from './ProductDetailModal';
import EditProductModal from './EditProductModal';
import SyncStatusBanner from './SyncStatusBanner';
import NotificationBadge from './NotificationBadge';
import CSVUploadModal from './CSVUploadModal';
import FilterDrawer from './FilterDrawer';
import { useCurrency } from '../../context/currencyContext';

import { useOfflineProducts } from './hooks/useOfflineProducts';
import { useOfflineSync } from './hooks/useOfflineSync';
import UpgradePlanModal from '../Shared/UpgradePlanModal';
import { PLANS, getProductLimit } from '../../../utils/planManager';


export default function ProductCatalogue() {
  const storeId = typeof window !== 'undefined' ? localStorage.getItem('store_id') : null;

  const [showAddForm, setShowAddForm] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { formatPrice } = useCurrency();
  const [currentPlan, setCurrentPlan] = useState(PLANS.FREE);
  const [subscription, setSubscription] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('team_limit');

  const {
    products,
    loading,
    error,
    isOnline,
    userPermissions,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
  } = useOfflineProducts(storeId);

  const {
    isSyncing,
    pendingCount,
    syncProgress,
    lastSyncTime,
    syncNow,
    notifications,
    clearNotification,
    clearAllNotifications
  } = useOfflineSync(storeId, refreshProducts);

  const filteredProducts = React.useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const name = (p.name || '').toLowerCase();
        const description = (p.description || '').toLowerCase();
        const deviceId = (p.device_id || '').toLowerCase();
        const imeis = (p.dynamic_product_imeis || '').toLowerCase();
        const supplier = (p.suppliers_name || '').toLowerCase();

        return name.includes(query) ||
          description.includes(query) ||
          deviceId.includes(query) ||
          imeis.includes(query) ||
          supplier.includes(query);
      });
    }

    if (activeFilter === 'unique') {
      result = result.filter(p => p.is_unique);
    } else if (activeFilter === 'standard') {
      result = result.filter(p => !p.is_unique);
    } else if (activeFilter === 'low-stock') {
      result = result.filter(p => (p.purchase_qty || 0) <= 5);
    }

    switch (sortBy) {
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'price-asc':
        result.sort((a, b) => (a.selling_price || 0) - (b.selling_price || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.selling_price || 0) - (a.selling_price || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
    }

    return result;
  }, [products, searchQuery, activeFilter, sortBy]);

  // Fetch plan
  React.useEffect(() => {
    const fetchPlan = async () => {
      const ownerId = localStorage.getItem('owner_id');
      if (ownerId) {
        const { data: subResult } = await supabase
          .rpc('get_owner_subscription', { p_owner_id: Number(ownerId) });
        const sub = subResult?.[0];
        setSubscription(sub || null);
        if (sub) {
          if (sub.status === 'active' || (sub.status === 'trialing' && sub.trial_end && new Date(sub.trial_end) > new Date())) {
            setCurrentPlan(sub.plan_name || PLANS.BUSINESS);
          } else {
            setCurrentPlan(PLANS.FREE);
          }
        }
      }
    };
    fetchPlan();
  }, [storeId]);

  const productLimit = getProductLimit(currentPlan, subscription);
  const isLimitReached = products.length >= productLimit;

  const handleAddClick = () => {
    if (isLimitReached) {
      setUpgradeReason('product_limit'); // Actually we need to update UpgradePlanModal to handle product_limit reason
      setShowUpgradeModal(true);
    } else {
      setShowAddForm(true);
    }
  };

  const handleCSVClick = () => {
    if (isLimitReached) {
      setUpgradeReason('product_limit');
      setShowUpgradeModal(true);
    } else {
      setShowCSVModal(true);
    }
  };

  const handleCreateProduct = async (productData) => {
    try {
      await createProduct(productData);
      // Note: Don't close form here - ProductForm handles success
    } catch (err) {
      // Re-throw the error so ProductForm can handle it and keep form open
      throw err;
    }
  };

  const handleUpdateProduct = async (productId, updates, inventoryDelta = 0) => {
    try {
      await updateProduct(productId, updates, inventoryDelta);
      setEditingProduct(null);
      toast.success(isOnline ? 'Product updated!' : 'Changes saved offline');
    } catch (err) {
      toast.error(err.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      setSelectedProduct(null);
      toast.success(isOnline ? 'Product deleted!' : 'Deletion queued for sync');
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshProducts();
      toast.success('Products refreshed');
    } catch (err) {
      toast.error('Failed to refresh');
    }
  };

  if (!storeId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No Store Selected</h2>
          <p className="text-slate-500 mt-2">Please select a store to manage products</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />

      <SyncStatusBanner
        isOnline={isOnline}
        isSyncing={isSyncing}
        pendingCount={pendingCount}
        syncProgress={syncProgress}
        lastSyncTime={lastSyncTime}
        onSync={syncNow}
      />

      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">

          {/* Top Row: Logo + Status + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            {/* Logo + Status */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Catalogue
                </h1>
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className={`flex items-center gap-1 ${isOnline ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                  <span className="text-slate-400">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-medium ${isLimitReached ? 'text-red-500' : 'text-slate-500'}`}>
                      {products.length}
                    </span>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-500">
                      {productLimit === Infinity ? '∞' : productLimit} products
                    </span>
                    {isLimitReached && (
                      <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Limit Reached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <NotificationBadge
                notifications={notifications}
                pendingCount={pendingCount}
                onClear={clearNotification}
                onClearAll={clearAllNotifications}
              />

              <button
                onClick={handleRefresh}
                disabled={loading || isSyncing}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${(loading || isSyncing) ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleAddClick}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-900 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Search + Filter + CSV + Currency */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">

            {/* Search */}
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, IMEI, barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all min-w-0"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>

            {/* Filter */}
            <button
              onClick={() => setShowFilterDrawer(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            {/* CSV */}
            <button
              onClick={handleCSVClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {/* Currency */}
            <div className="flex justify-end sm:ml-auto mt-2 sm:mt-0">
              <CurrencySelector />
            </div>
          </div>
        </div>
      </header>


      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500">Loading products...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              {searchQuery ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-slate-500 mt-1 text-center max-w-sm">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Add your first product to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleAddClick}
                className="mt-6 flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={`${product.id}-${product.created_at || index}`}
                  product={product}
                  index={index}
                  formatPrice={formatPrice}
                  onView={() => setSelectedProduct(product)}
                  onEdit={() => setEditingProduct(product)}
                  onDelete={() => handleDeleteProduct(product.id)}
                  isOffline={!isOnline}
                  isPending={product.sync_status === 'pending'}
                  permissions={userPermissions}
                />
              ))}
            </AnimatePresence>
          </div>

        )}
      </main>

      <AnimatePresence>
        {showAddForm && (
          <ProductForm
            storeId={storeId}
            onSave={handleCreateProduct}
            onClose={() => setShowAddForm(false)}
            isOnline={isOnline}
          />
        )}

        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            storeId={storeId}
            formatPrice={formatPrice}
            isOpen={true}
            onClose={() => setSelectedProduct(null)}
          />
        )}

        {editingProduct && (
          <EditProductModal
            product={editingProduct}
            storeId={storeId}
            isStoreOwner={userPermissions.canDelete}
            onSave={handleUpdateProduct}
            onClose={() => setEditingProduct(null)}
          />
        )}

        {showCSVModal && (
          <CSVUploadModal
            storeId={storeId}
            onSuccess={refreshProducts}
            onClose={() => setShowCSVModal(false)}
            isOnline={isOnline}
          />
        )}

        {showFilterDrawer && (
          <FilterDrawer
            activeFilter={activeFilter}
            sortBy={sortBy}
            onFilterChange={setActiveFilter}
            onSortChange={setSortBy}
            onClose={() => setShowFilterDrawer(false)}
          />
        )}
      </AnimatePresence>

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
        reason={upgradeReason}
      />
    </div>
  );
}