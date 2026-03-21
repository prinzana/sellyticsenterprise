import React, { useState, useEffect } from 'react';
import { Loader2, FileText } from 'lucide-react';
import useReceiptManager from './useReceiptManager';
import useReceiptCustomization from './useReceiptCustomization';
import SaleGroupsList from './SaleGroupsList';
import ReceiptModal from './ReceiptModal';
import ReceiptCustomizer from './ReceiptCustomizer';
import BulkDeleteConfirm from './BulkDeleteConfirm';
import FilterPanel from './FilterPanel';
import ReceiptEditModal from './ReceiptEditModal';
import { supabase } from '../../../supabaseClient';
import { PLANS, getEffectivePlan } from '../../../utils/planManager';
import UpgradePlanModal from '../Shared/UpgradePlanModal';
import SearchInput from '../ui/SearchInput';

export default function ReceiptManager() {
  const [storeId, setStoreId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(PLANS.FREE);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('feature_locked');
  const [isEditingDirectly, setIsEditingDirectly] = useState(false);

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

  const handleDirectEdit = async (group) => {
    if (currentPlan === 'FREE') {
      handleApplyLock('feature_locked');
      return;
    }
    setIsEditingDirectly(true);
    await openReceiptModal(group);
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header & Search Zone */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Receipt Manager
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {store?.shop_name || 'Loading store details...'}
                </p>
              </div>
            </div>

            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by sale ID, amount, payment method..."
              containerClassName="w-full"
            />
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
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-1 sm:px-0">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 dark:shadow-none shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Sales & Receipts
                  </h2>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
                    {filteredSaleGroups.length} sale{filteredSaleGroups.length !== 1 ? 's' : ''} recorded
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 sm:rounded-2xl border-y sm:border border-slate-200 dark:border-slate-700 shadow-sm -mx-4 sm:mx-0 p-4 sm:p-6 overflow-hidden">
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
                  onEditGroup={handleDirectEdit}
                  currentPlan={currentPlan}
                  onLock={handleApplyLock}
                  onBulkDelete={() => {
                    if (currentPlan === PLANS.FREE) handleApplyLock('feature_locked');
                    else setShowBulkDeleteModal(true);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 sm:rounded-2xl p-12 text-center border-y sm:border border-slate-200 dark:border-slate-700 shadow-sm -mx-4 sm:mx-0">
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
        isOpen={!!selectedReceipt && !isEditingDirectly}
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

      {isEditingDirectly && selectedReceipt && (
        <ReceiptEditModal
          isOpen={isEditingDirectly}
          onClose={() => {
            setIsEditingDirectly(false);
            closeReceiptModal();
          }}
          receipt={selectedReceipt}
          onSave={async (receiptId, updates) => {
            const success = await updateReceipt(receiptId, updates);
            if (success) {
              setIsEditingDirectly(false);
              closeReceiptModal();
            }
          }}
        />
      )}

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