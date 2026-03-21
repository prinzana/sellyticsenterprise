import React from 'react';
import SearchInput from '../ui/SearchInput';

export default function CustomerSearch({ searchTerm, setSearchTerm, resetPage }) {
  return (
    <SearchInput
      value={searchTerm}
      onChange={(val) => {
        setSearchTerm(val);
        resetPage();
      }}
      placeholder="Search by name..."
    />
  );
}