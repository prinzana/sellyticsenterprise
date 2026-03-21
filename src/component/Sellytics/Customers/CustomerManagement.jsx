// src/components/Customers/CustomerManagement.jsx
import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { useCustomers } from './useCustomers';
import CustomerHeader from './CustomerHeader';
import CustomerSearch from './CustomerSearch';
import CustomerList from './CustomerList';
import CustomerModal from './CustomerModal';

export default function CustomerManagement() {
  const storeId = Number(localStorage.getItem('store_id'));
  const {
    customers,
    loading,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    totalCount,
    pageSize,
    refresh,
    resetPage,
  } = useCustomers(storeId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const openNew = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    const { error } = await supabase.from('customer').delete().eq('id', id);
    if (error) alert('Error deleting customer');
    else refresh();
  };

  if (!storeId) {
    return <div className="text-center py-12 text-red-600 text-2xl">No store selected</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <CustomerHeader onNewCustomer={openNew} />

      <CustomerSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} resetPage={resetPage} />

      <CustomerList
        customers={customers}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        totalCount={totalCount}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
      />

      <CustomerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={editingCustomer}
        onSave={() => {
          refresh();
          resetPage();
        }}
      />
    </div>
  );
}