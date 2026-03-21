// src/components/Customers/CustomerList.jsx
import React from 'react';
import CustomerCard from './CustomerCard';

export default function CustomerList({ customers, loading, onEdit, onDelete, totalCount, page, setPage, pageSize }) {
  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading customers...</div>;
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-xl font-medium">No customers found</p>
        <p className="text-sm mt-2">Add your first customer to get started.</p>
      </div>
    );
  }

  return (
    <div className="-mx-4 sm:mx-0 flex flex-col border-y border-slate-200 dark:border-slate-800 sm:border-y-0 sm:space-y-4 pb-4 sm:pb-0">
      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          customer={customer}
          onEdit={() => onEdit(customer)}
          onDelete={() => onDelete(customer.id)}
        />
      ))}

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 mt-6 sm:mt-8 px-2 sm:px-0">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3.5 sm:px-5 py-2 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[13px] sm:text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all shadow-sm focus:outline-none whitespace-nowrap active:scale-[0.98]"
          >
            Previous
          </button>
          <span className="px-3.5 sm:px-5 py-2 sm:py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[13px] sm:text-sm font-bold rounded-xl shadow-inner whitespace-nowrap text-center flex-1 sm:flex-none">
            Page {page + 1} of {Math.ceil(totalCount / pageSize)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={(page + 1) * pageSize >= totalCount}
            className="px-3.5 sm:px-5 py-2 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[13px] sm:text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all shadow-sm focus:outline-none whitespace-nowrap active:scale-[0.98]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}