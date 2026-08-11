import React, { useState } from 'react';
import { Plus, RotateCcw, Loader2 } from 'lucide-react';
import { TAB_FILTERS } from './returnsConstants';
import { supabase } from "../../../supabaseClient";
import { useReturnsData } from './useReturnsData';
import { useReturnsActions } from './useReturnsActions';
import { useInventoryProducts } from './useInventoryProducts';

import ReturnsTabs from './ReturnsTabs';
import ReturnsFilters from './ReturnsFilters';
import ReturnsList from './ReturnsList';
import ReturnsPagination from './ReturnsPagination';
import InspectionModal from './InspectionModal';
import InitiateReturnForm from './InitiateReturnForm';

export default function ReturnsCenter({ 
  selectedWarehouse, 
  warehouses = [], 
  clients = [],
  userId: propUserId  // optional fallback
}) {
  const warehouseId = selectedWarehouse?.id;
  const warehouseName = selectedWarehouse?.name || "Warehouse";

  // Use store_id from localStorage as the primary identifier
  // This is your main custom auth value
  const storeId = localStorage.getItem('store_id');

  // Final identifier for hooks: prop > localStorage > fallback
  const effectiveUserId = propUserId || storeId || "unknown-store";

  // === HOOKS (called unconditionally - Rules of Hooks compliant) ===
  const returnsData = useReturnsData({
    supabase,
    warehouseId: warehouseId || null,
    userId: effectiveUserId,
    initialFilters: { status: TAB_FILTERS.PENDING }
  });

  const returnsActions = useReturnsActions({
    supabase,
    warehouseId: warehouseId || null,
    userId: effectiveUserId,
    onSuccess: (action) => {
      if (action === 'create') {
        setShowInitiateForm(false);
        setInitiateData({ clientId: '', productId: '', quantity: 1, reason: '', status: 'REQUESTED' });
      } else if (action === 'update') {
        setShowInspectionModal(false);
        setSelectedReturn(null);
      } else if (action === 'bulk_delete') {
        setSelectedIds([]);
      }
      returnsData.refetch?.();
    }
  });

  const inventoryProducts = useInventoryProducts({
    supabase,
    warehouseId: warehouseId || null,
    userId: effectiveUserId
  });

  const { getProductsForClient = () => [] } = inventoryProducts;

  // === Local State ===
  const [activeTab, setActiveTab] = useState(TAB_FILTERS.PENDING);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showInitiateForm, setShowInitiateForm] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState(null);

  const [inspectionData, setInspectionData] = useState({
    condition: '',
    newStatus: '',
    notes: ''
  });

  const [initiateData, setInitiateData] = useState({
    clientId: '',
    productId: '',
    quantity: 1,
    reason: '',
    status: 'REQUESTED',
  });

  // === Handlers ===
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    returnsData.updateFilters({ status: tab });
    setSelectedIds([]);
    returnsData.setPage?.(1);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    returnsData.updateFilters({ searchQuery: query });
    returnsData.setPage?.(1);
  };

  const handleWarehouseChange = (whId) => {
    setWarehouseFilter(whId || null);
    returnsData.updateFilters({ warehouseFilter: whId || null });
    returnsData.setPage?.(1);
  };

  const openInspection = (returnItem) => {
    setSelectedReturn(returnItem);
    setInspectionData({
      condition: returnItem.condition || 'OPENED',
      newStatus: '',
      notes: returnItem.inspection_notes || ''
    });
    setShowInspectionModal(true);
  };

  const handleInspectionSubmit = async () => {
    if (!selectedReturn) return;
    await returnsActions.processReturn(selectedReturn.id, inspectionData);
  };

  const handleCreateReturn = async () => {
    await returnsActions.createReturn(initiateData);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedIds.length} return(s)?`)) return;
    await returnsActions.bulkDelete(selectedIds);
  };

  const handleExport = () => {
    returnsActions.exportReturns({ status: activeTab, searchQuery, warehouseFilter });
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // === Guard: Only wait for warehouse (store_id is always available after login) ===
  if (!warehouseId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-600 text-lg">Loading Returns Center...</p>
        <p className="text-slate-500 text-sm">Waiting for warehouse selection...</p>
      </div>
    );
  }

  // === Main Render ===
  return (
  <div className="space-y-4 sm:space-y-6">
    {/* Compact Header */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      {/* Title Section */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span className="truncate">Returns Center</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 leading-tight">
          Manage returns • <span className="font-medium">{warehouseName}</span>
        </p>
      </div>

      {/* Action Button - Responsive */}
      <button
        onClick={() => setShowInitiateForm(true)}
        className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 font-medium text-sm sm:text-base shadow-sm hover:shadow-md"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden xs:inline">New Return</span>
        <span className="xs:hidden">New</span>
      </button>
    </div>

    
      <ReturnsTabs
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        counts={returnsData.counts}
      />

      <ReturnsFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onExport={handleExport}
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDelete}
        warehouses={warehouses}
        selectedWarehouse={warehouseFilter || warehouseId}
        onWarehouseChange={handleWarehouseChange}
      />

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6">
          {returnsData.loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
          ) : returnsData.returns.length === 0 ? (
            <p className="text-center py-12 text-slate-500 dark:text-slate-400">No returns found</p>
          ) : (
            <>
              <ReturnsList
                returns={returnsData.returns}
                loading={returnsData.loading}
                onInspect={openInspection}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelection}
                showSelection={activeTab === TAB_FILTERS.PENDING}
              />

              <div className="mt-6">
                <ReturnsPagination
                  page={returnsData.page}
                  pageSize={returnsData.pageSize}
                  totalCount={returnsData.totalCount}
                  onPageChange={returnsData.setPage}
                  onPageSizeChange={returnsData.setPageSize}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <InspectionModal
        show={showInspectionModal}
        onClose={() => {
          setShowInspectionModal(false);
          setSelectedReturn(null);
        }}
        selectedReturn={selectedReturn}
        inspectionData={inspectionData}
        setInspectionData={setInspectionData}
        processing={returnsActions.processing}
        onSubmit={handleInspectionSubmit}
      />

      <InitiateReturnForm
        show={showInitiateForm}
        onClose={() => setShowInitiateForm(false)}
        clients={clients}
        getProductsForClient={getProductsForClient}
        initiateData={initiateData}
        setInitiateData={setInitiateData}
        processing={returnsActions.processing}
        onSubmit={handleCreateReturn}
      />
    </div>
  );
}