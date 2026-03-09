/**
 * SwiftInventory - useInventorySearch Hook
 * Search and filter inventory
 */
import { useState, useMemo } from 'react';

export default function useInventorySearch(inventory) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'low', 'out', 'in'

  const filteredInventory = useMemo(() => {
    if (!inventory?.length) return [];

    return inventory.filter(item => {
      const product = item.dynamic_product;
      if (!product) return false;

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(term);
        const matchesCategory = product.category?.toLowerCase().includes(term);
        const matchesBarcode = product.barcode?.toLowerCase().includes(term);
        const matchesImei = product.dynamic_product_imeis?.toLowerCase().includes(term);

        if (!matchesName && !matchesCategory && !matchesBarcode && !matchesImei) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all' && product.category !== categoryFilter) {
        return false;
      }

      // Stock filter
      const qty = item.available_qty ?? 0;
      if (stockFilter === 'out' && qty > 0) return false;
      if (stockFilter === 'low' && (qty === 0 || qty > 5)) return false;
      if (stockFilter === 'in' && qty <= 0) return false;

      return true;
    });
  }, [inventory, searchTerm, categoryFilter, stockFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set();
    inventory?.forEach(item => {
      if (item.dynamic_product?.category) {
        cats.add(item.dynamic_product.category);
      }
    });
    return Array.from(cats).sort();
  }, [inventory]);

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter,
    filteredInventory,
    categories
  };
}