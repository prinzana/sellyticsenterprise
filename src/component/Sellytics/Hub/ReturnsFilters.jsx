import React from 'react';
import { Search, Download, Trash2 } from 'lucide-react';

export default function ReturnsFilters({ 
  searchQuery, 
  onSearchChange, 
  onExport, 
  selectedCount, 
  onBulkDelete,
  warehouses = [],
  selectedWarehouse,
  onWarehouseChange
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 w-full">
      
      {/* Search Box */}
      <div className="relative flex-shrink-0 w-full sm:flex-1 sm:min-w-[250px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search by product, SKU, or reason..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Warehouse Dropdown */}
      {warehouses && warehouses.length > 0 && (
        <div className="flex-shrink-0">
          <select
            value={selectedWarehouse || ''}
            onChange={(e) => onWarehouseChange(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {selectedCount > 0 && (
          <button
            onClick={onBulkDelete}
            className="px-4 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete ({selectedCount})
          </button>
        )}
        
        <button
          onClick={onExport}
          className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  );
}
