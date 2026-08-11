// TransferHub.jsx - Updated for Multi-Client Support
import React from "react";
import { useTransferHub } from "./useTransferHub";
import TransferTabs from "./TransferTabs";
import NewTransferView from "./NewTransferView";
import TransferHistoryView from "./TransferHistoryView";
import ConfirmTransferModal from "./ConfirmTransferModal";

export default function TransferHub() {
  // Removed warehouseId prop – we now support multiple warehouses
  const {
    activeTab,
    setActiveTab,

    // Source selection
    userWarehouses,
    sourceWarehouseId,
    setSourceWarehouseId,
    warehouseClients,
    sourceClientId,
    setSourceClientId,

    // Destination
    userStores,
    destinationStoreId,
    setDestinationStoreId,

    // Products & Cart
    filteredProducts,
    loading,
    selectedItems,
    totalItems,
    searchQuery,
    setSearchQuery,
    addToTransfer,
    updateQuantity,
    removeFromTransfer,

    // History & Modal
    transfers,
    showConfirmModal,
    setShowConfirmModal,
    transferring,
    executeTransfer,
  } = useTransferHub(); // No warehouseId passed anymore

  return (
    <div className="space-y-6 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Transfer Hub</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Move inventory from warehouse clients to stores
          </p>
        </div>
      </div>

      <TransferTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "new" && (
        <NewTransferView
          // Source
          userWarehouses={userWarehouses}
          sourceWarehouseId={sourceWarehouseId}
          setSourceWarehouseId={setSourceWarehouseId}
          warehouseClients={warehouseClients}
          sourceClientId={sourceClientId}
          setSourceClientId={setSourceClientId}

          // Destination
          userStores={userStores}
          destinationStoreId={destinationStoreId}
          setDestinationStoreId={setDestinationStoreId}

          // Products & UI
          filteredProducts={filteredProducts}
          loading={loading}
          selectedItems={selectedItems}
          totalItems={totalItems}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          addToTransfer={addToTransfer}
          updateQuantity={updateQuantity}
          removeFromTransfer={removeFromTransfer}
          setShowConfirmModal={setShowConfirmModal}
        />
      )}

      {activeTab === "history" && <TransferHistoryView transfers={transfers} />}

      <ConfirmTransferModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        selectedItems={selectedItems}
        totalItems={totalItems}
        userStores={userStores}
        destinationStoreId={destinationStoreId}
        transferring={transferring}
        onConfirm={executeTransfer}
        userWarehouses={userWarehouses}
  sourceWarehouseId={sourceWarehouseId}
  warehouseClients={warehouseClients}
  sourceClientId={sourceClientId}
      />
    </div>
  );
}