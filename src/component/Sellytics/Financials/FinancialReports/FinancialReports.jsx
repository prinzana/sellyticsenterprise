import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

import useStores from './useStores'; // Now receives ownerId
import { useLedger } from './useLedger';
import { useLedgerFilters } from './useLedgerFilters';
//import { useCurrency } from '../../../context/currencyContext'; // Required for formatPrice in table/card

import LedgerFilters from './LedgerFilters';
import LedgerStatsCards from './LedgerStatsCards';
import LedgerList from './LedgerList';
import LedgerActions from './LedgerActions';


export default function GeneralLedger() {


  // Owner & Store from localStorage
  const [ownerId, setOwnerId] = useState(() => Number(localStorage.getItem('owner_id')) || null);
  const [storeId, setStoreId] = useState(() => {
    const id = localStorage.getItem('store_id');
    return id ? Number(id) : null;
  });
  // default view
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [view, setView] = useState(() => {
    return localStorage.getItem('ledger_view') || 'card';
  });

  // Whenever view changes, store it
  useEffect(() => {
    localStorage.setItem('ledger_view', view);
  }, [view]);
  // Pass ownerId to fetch correct stores
  const { stores, isLoading: storesLoading } = useStores(ownerId);

  const {
    ledgerEntries,
    fetchLedger,
    deleteEntry,
    deleteMultiple,
    archiveEntry,
  } = useLedger();

  const {
    searchTerm,
    isFetching,
    setSearchTerm,
    accountFilter,
    setAccountFilter,
    dateRange,
    setDateRange,
    currentPage,
    setCurrentPage,
    filteredEntries,
    paginatedEntries,
    totals,
    totalPages,
    clearFilters,
  } = useLedgerFilters(ledgerEntries);

  const isLoading = storesLoading || isFetching;

  // Sync localStorage changes across tabs/sessions
  useEffect(() => {
    const syncStorage = () => {
      const newOwnerId = Number(localStorage.getItem('owner_id')) || null;
      const newStoreId = localStorage.getItem('store_id') ? Number(localStorage.getItem('store_id')) : null;

      setOwnerId(newOwnerId);
      setStoreId(newStoreId);
    };

    syncStorage();
    window.addEventListener('storage', syncStorage);
    const interval = setInterval(syncStorage, 1000);

    return () => {
      window.removeEventListener('storage', syncStorage);
      clearInterval(interval);
    };
  }, []);

  // Fetch ledger entries when store changes
  useEffect(() => {
    if (storeId) {
      fetchLedger(storeId);
    }
  }, [storeId, fetchLedger]);

  // Selection handlers
  const handleSelectEntry = (entryId, checked) => {
    setSelectedEntries(prev =>
      checked ? [...prev, entryId] : prev.filter(id => id !== entryId)
    );
  };

  const handleSelectAll = () => {
    setSelectedEntries(
      selectedEntries.length === paginatedEntries.length
        ? []
        : paginatedEntries.map(e => e.id)
    );
  };

  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await deleteEntry(entryId);
      setSelectedEntries(prev => prev.filter(id => id !== entryId));
    }
  };

  const handleDeleteMultiple = async (entryIds) => {
    if (window.confirm(`Delete ${entryIds.length} entries?`)) {
      await deleteMultiple(entryIds);
      setSelectedEntries([]);
    }
  };

  const handleArchive = async (entryId) => {
    if (window.confirm('Are you sure you want to archive this entry?')) {
      await archiveEntry(entryId);
      setSelectedEntries(prev => prev.filter(id => id !== entryId));
    }
  };

  // Not logged in
  if (!ownerId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">
            Please log in to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">


      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
          General Ledger
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Complete transaction history and financial tracking
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <LedgerFilters
          stores={stores}
          storeId={storeId}
          setStoreId={setStoreId}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          accountFilter={accountFilter}
          setAccountFilter={setAccountFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          clearFilters={clearFilters}
          isLoading={isLoading}
        />
      </div>

      {/* Stats Cards */}
      {storeId && !isLoading && filteredEntries.length > 0 && (
        <div className="mb-8">
          <LedgerStatsCards totals={totals} />
        </div>
      )}

      {/* Bulk Actions */}
      {storeId && !isLoading && filteredEntries.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedEntries.length === paginatedEntries.length && paginatedEntries.length > 0}
              onChange={handleSelectAll}
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {selectedEntries.length > 0 ? `${selectedEntries.length} selected` : 'Select all'}
            </span>
          </div>
          <LedgerActions
            selectedEntries={selectedEntries}
            onDeleteMultiple={handleDeleteMultiple}
            filteredEntries={filteredEntries}
          />
        </div>
      )}

      {/* Ledger Entries */}
      {storeId && !isLoading && (
        <>
          {paginatedEntries.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                No transactions found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <LedgerList
              entries={paginatedEntries}
              selectedIds={selectedEntries}
              onSelect={handleSelectEntry}
              onDelete={handleDelete}
              onArchive={handleArchive}
              view={view} // pass view here
              setView={setView}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mt-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing {((currentPage - 1) * 12) + 1} to{' '}
                {Math.min(currentPage * 12, filteredEntries.length)} of {filteredEntries.length} entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300">

                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Global Loading */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="text-slate-700 dark:text-slate-300 font-medium">Loading ledger...</p>
          </div>
        </div>
      )}
    </div>
  );
}
