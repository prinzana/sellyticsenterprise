import React from 'react';
import SearchInput from '../ui/SearchInput';

export default function SearchBar({ value, onChange, disabled }) {
  return (
    <div className="md:col-span-2">
      <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Search Inventory</label>
      <SearchInput
        value={value}
        onChange={onChange}
        placeholder="Search products..."
        disabled={disabled}
      />
    </div>
  );
}