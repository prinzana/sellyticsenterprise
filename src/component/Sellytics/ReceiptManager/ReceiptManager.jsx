import React, { useState, useEffect } from 'react';
import { Search, Trash2, Loader2, FileText } from 'lucide-react';
import useReceiptManager from './useReceiptManager';
import useReceiptCustomization from './useReceiptCustomization';
import SaleGroupsList from './SaleGroupsList';
import ReceiptModal from './ReceiptModal';
import ReceiptCustomizer from './ReceiptCustomizer';
import BulkDeleteConfirm from './BulkDeleteConfirm';
import FilterPanel from './FilterPanel';
import { supabase } from '../../../supabaseClient';
import { PLANS, getEffectivePlan } from '../../../utils/planManager';
import UpgradePlanModal from '../Shared/UpgradePlanModal';

export default function ReceiptManager() {
  const [storeId, setStoreId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(PLANS.FREE);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('feature_locked');

  const {
    store,
    filteredSaleGroups,
    selectedSaleGroup,
    selectedReceipt,
    loading,
    canDelete,
    selectedIds,
    setSelectedIds,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    openReceiptModal,
    updateReceipt,
    deleteSaleGroup,
    bulkDeleteSaleGroups,
    getProductGroups,
    closeReceiptModal
  } = useReceiptManager(storeId, userEmail);

  const { styles, updateStyle, resetStyles } = useReceiptCustomization();

  useEffect(() => {
    const initAuth = async () => {
      const storedStoreId = localStorage.getItem('store_id');
      const storedUserEmail = localStorage.getItem('user_email');
      setStoreId(storedStoreId);
      setUserEmail(storedUserEmail);
    };
    initAuth();
  }, []);

  // Fetch Plan
  useEffect(() => {
    const fetchPlan = async () => {
      const ownerId = localStorage.getItem('owner_id');
      if (!storeId) return;

      try {
        // 1. Fetch store's base data for legacy trial calculation
        const { data: storeData } = await supabase
          .from('stores')
          .select('plan, created_at')
          .eq('id', storeId)
          .single();

        let sub = null;
        if (ownerId) {
          // 2. Fetch "real" subscription from DB
          const { data: subResult } = await supabase.rpc('get_owner_subscription', { p_owner_id: Number(ownerId) });
          sub = subResult?.[0];
        }

        // 3. Determine effective plan using centralized logic
        const effective = getEffectivePlan(
          storeData?.plan || PLANS.FREE,
          sub || storeData?.created_at
        );
        
        setCurrentPlan(effective);
      } catch (err) {
        console.error('Plan fetch error:', err);
      }
    };
    fetchPlan();
  }, [storeId]);

  const handleApplyLock = (reason = 'feature_locked') => {
    setUpgradeReason(reason);
    setShowUpgradeModal(true);
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (groups) => {
    const allIds = groups.map(g => g.id);
    const allSelected = allIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...allIds])]);
    }
  };

  const handleBulkDelete = async () => {
    await bulkDeleteSaleGroups(selectedIds);
    setShowBulkDeleteModal(false);
  };

  const productGroups = selectedSaleGroup ? getProductGroups(selectedSaleGroup) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading receipts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-0 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-6 md:p-8 border-2 border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  Receipt Manager
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {store?.shop_name || 'Loading store...'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {selectedIds.length > 0 && canDelete && (
                  <button
                    onClick={() => {
                      if (currentPlan === PLANS.FREE) handleApplyLock('feature_locked');
                      else setShowBulkDeleteModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold transition shadow-lg shadow-red-500/30"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete {selectedIds.length}
                    {currentPlan === PLANS.FREE && (
                      <svg className="w-3 h-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by sale ID, amount, payment method..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          <FilterPanel
            filters={filters}
            onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
            onClearFilters={() => setFilters({ paymentMethod: 'all', dateRange: 'all' })}
          />

          <ReceiptCustomizer
            styles={styles}
            updateStyle={updateStyle}
            resetStyles={resetStyles}
            currentPlan={currentPlan}
            onLock={handleApplyLock}
          />

          {filteredSaleGroups.length > 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-6 border-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Sales & Receipts
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {filteredSaleGroups.length} sale{filteredSaleGroups.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>

              <SaleGroupsList
                saleGroups={filteredSaleGroups}
                selectedGroup={selectedSaleGroup}
                onSelectGroup={openReceiptModal}
                canDelete={canDelete}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                itemsPerPage={20}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-12 text-center border-2 border-slate-200 dark:border-slate-700">
              <FileText className="w-20 h-20 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No Sales Found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {searchTerm ? 'Try a different search term' : 'Sales will appear here once created'}
              </p>
            </div>
          )}
        </div>
      </div>

      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={closeReceiptModal}
        receipt={selectedReceipt}
        saleGroup={selectedSaleGroup}
        store={store}
        productGroups={productGroups}
        styles={styles}
        onUpdate={updateReceipt}
        onDelete={deleteSaleGroup}
        canDelete={canDelete}
        currentPlan={currentPlan}
        onLock={handleApplyLock}
      />

      <BulkDeleteConfirm
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        count={selectedIds.length}
      />

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
        reason={upgradeReason}
      />
    </>
  );
}