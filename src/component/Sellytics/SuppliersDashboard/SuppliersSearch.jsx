import React from 'react';
import SearchInput from '../ui/SearchInput';

export default function SuppliersSearch({ search, setSearch }) {
  return (
    <SearchInput
      value={search}
      onChange={setSearch}
      placeholder="Search by supplier, device name, or IDs..."
      className="mb-6"
    />
  );
}