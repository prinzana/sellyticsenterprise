// src/components/Suppliers/SuppliersInventory.jsx
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../supabaseClient';
import { useSuppliersInventory } from './useSuppliersInventory';
import SuppliersHeader from './SuppliersHeader';
import SuppliersSearch from './SuppliersSearch';
import SuppliersFilters from './SuppliersFilters';
import SuppliersTableRow from './SuppliersTableRow';
import DeviceIdsModal from './DeviceIdsModal';
import SupplierModal from './SupplierModal';
import SupplierDetailModal from './SupplierDetailModal';

export default function SuppliersInventory() {
  const storeId = localStorage.getItem('store_id');
  const {
    filtered,
    loading,
    search,
    setSearch,
    filters,
    setFilters,
    suppliers,
    clearFilters,
    refresh,
  } = useSuppliersInventory(storeId);

  const [currentPage, setCurrentPage] = useState(1);
  const [showDetail, setShowDetail] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // <-- For editing
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const itemsPerPage = 15;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const exportCSV = () => { /* your logic */ };
  const exportPDF = () => { /* your logic */ };

  const deleteItem = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.from('suppliers_inventory').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success(' Supplier Info Deleted successfully');
      refresh();
    }
  };

  if (!storeId) {
    return <div className="text-center py-12 text-red-600 text-2xl">No store selected</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <SuppliersHeader
        onExportCSV={exportCSV}
        onExportPDF={exportPDF}
        onNewInventory={() => {
          setEditingItem(null);
          setShowCreateModal(true);
        }}
      />

      <SuppliersSearch search={search} setSearch={setSearch} />

      <SuppliersFilters
        showFilters={true}
        setShowFilters={() => {}}
        filters={filters}
        setFilter={(field, value) => setFilters(field, value)}
        suppliers={suppliers}
        clearFilters={clearFilters}
      />

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading inventory...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 bg-white dark:bg-slate-800 sm:rounded-2xl border-y sm:border border-slate-200 dark:border-slate-700 -mx-4 sm:mx-0 shadow-sm">
          <p className="text-xl font-medium">No inventory items found</p>
          <p className="text-sm mt-2">Click "New Inventory" to add one.</p>
        </div>
      ) : (
        <div className="-mx-4 sm:mx-0 flex flex-col border-y border-slate-200 dark:border-slate-800 sm:border-y-0 sm:space-y-4 pb-4 sm:pb-0">
          {paginated.map((item) => (
            <SuppliersTableRow
              key={item.id}
              item={item}
              onViewIds={() => setShowDetail(item)}
              onEdit={() => {
                setEditingItem(item);
                setShowCreateModal(true);
              }}
              onDelete={() => deleteItem(item.id, item.device_name)}
              onViewSupplier={() => setSelectedSupplier(item.supplier_name)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 mt-6 sm:mt-8 px-2 sm:px-0">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3.5 sm:px-5 py-2 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[13px] sm:text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all shadow-sm focus:outline-none whitespace-nowrap active:scale-[0.98]"
          >
            Previous
          </button>
          <span className="px-3.5 sm:px-5 py-2 sm:py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[13px] sm:text-sm font-bold rounded-xl shadow-inner whitespace-nowrap text-center flex-1 sm:flex-none">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3.5 sm:px-5 py-2 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[13px] sm:text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all shadow-sm focus:outline-none whitespace-nowrap active:scale-[0.98]"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      <DeviceIdsModal
        item={showDetail}
        open={!!showDetail}
        onClose={() => setShowDetail(null)}
        search={search}
      />

      <SupplierModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingItem(null);
        }}
        item={editingItem}
        onSave={() => {
          refresh();
          setCurrentPage(1);
          setEditingItem(null);
        }}
      />

      <SupplierDetailModal
        supplierName={selectedSupplier}
        open={!!selectedSupplier}
        onClose={() => setSelectedSupplier(null)}
      />
    </div>
  );
}