// src/components/Debts/EditDebtModal/DebtEntry.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import DeviceIdSection from './DeviceIdSection';
import { FaTrash } from 'react-icons/fa';
import { Camera, AlertCircle, Search, ChevronDown } from 'lucide-react';

export default function DebtEntry({
  entry,
  index,
  customers,
  products,
  isEdit,
  onChange,
  onRemove,
  onAddDeviceRow,
  onRemoveDevice,
  onOpenScanner, // (entryIndex, deviceIndex) => void
}) {
  const [errors, setErrors] = useState({});
  const isUnique = entry.isUniqueProduct && entry.dynamic_product_id;



  // Validation function (wrapped in useCallback)
  const validateField = useCallback((field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'customer_id':
        if (!value || value === '') {
          newErrors.customer_id = 'Customer is required';
        } else {
          delete newErrors.customer_id;
        }
        break;
      case 'dynamic_product_id':
        if (!value || value === '') {
          newErrors.dynamic_product_id = 'Product is required';
        } else {
          delete newErrors.dynamic_product_id;
        }
        break;
      case 'qty':
        if (!value || value < 1) {
          newErrors.qty = 'Quantity must be at least 1';
        } else {
          delete newErrors.qty;
        }
        break;
      case 'owed':
        if (value === undefined || value === null || value < 0) {
          newErrors.owed = 'Owed amount is required';
        } else {
          delete newErrors.owed;
        }
        break;
      case 'date':
        if (!value) {
          newErrors.date = 'Date is required';
        } else {
          delete newErrors.date;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [errors]); // Depend on errors

  // Validate on blur
  const handleBlur = (field, value) => {
    validateField(field, value);
  };

  // Validate all fields (wrapped in useCallback)
  const validateAll = useCallback(() => {
    const fieldsToValidate = ['customer_id', 'dynamic_product_id', 'qty', 'owed', 'date'];
    let allValid = true;

    fieldsToValidate.forEach(field => {
      const isValid = validateField(field, entry[field]);
      if (!isValid) allValid = false;
    });

    return allValid;
  }, [entry, validateField]); // Depend on entry and validateField

  // Expose validation to parent (optional)
  useEffect(() => {
    if (entry.validate) {
      validateAll();
    }
  }, [entry.validate, validateAll]);


  // Handle change with validation
  const handleChange = (field, value) => {
    onChange(index, field, value);
    // Validate after change if field was previously in error
    if (errors[field]) {
      setTimeout(() => validateField(field, value), 100);
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 sm:p-6 mb-6 bg-gray-50 dark:bg-gray-800 w-full overflow-x-hidden">

      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300">
          {isEdit ? 'Debt Details' : `Entry ${index + 1}`}
        </h3>

        {!isEdit && index !== 0 && (
          <button
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
            aria-label="Remove entry"
          >
            <FaTrash className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Customer */}
        <div className="w-full min-w-0">
          <label className="block text-sm font-medium mb-1">
            Customer <span className="text-red-500">*</span>
          </label>
          <SearchableCustomerDropdown
            customers={customers}
            selectedCustomerId={entry.customer_id}
            onSelect={(value) => handleChange('customer_id', value)}
            onBlur={(value) => handleBlur('customer_id', value)}
            hasError={!!errors.customer_id}
          />
          {errors.customer_id && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.customer_id}</span>
            </div>
          )}
        </div>

        {/* Product + Camera */}
        <div className="w-full min-w-0">
          <label className="block text-sm font-medium mb-1">
            Product <span className="text-red-500">*</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="flex-1 min-w-0">
              <SearchableProductDropdown
                products={products}
                selectedProductId={entry.dynamic_product_id}
                onSelect={(value) => handleChange('dynamic_product_id', value)}
                onBlur={(value) => handleBlur('dynamic_product_id', value)}
                hasError={!!errors.dynamic_product_id}
              />
              {errors.dynamic_product_id && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.dynamic_product_id}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onOpenScanner(index, null)}
              className="
                w-full sm:w-auto
                px-4 py-3
               hover:bg-indigo-100
                text-indigo-600 rounded-lg
                font-medium
                flex items-center justify-center
                shrink-0
              "
              title="Scan barcode"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div className="w-full">
          <label className="block text-sm font-medium mb-1">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={entry.qty}
            disabled={isUnique}
            onChange={(e) => handleChange('qty', parseInt(e.target.value) || 1)}
            onBlur={(e) => handleBlur('qty', parseInt(e.target.value) || 1)}
            className={`w-full p-3 border rounded-lg ${isUnique
              ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
              : errors.qty
                ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-900'
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900'
              }`}
          />
          {errors.qty && !isUnique && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.qty}</span>
            </div>
          )}
        </div>

        {/* Owed */}
        <div className="w-full">
          <label className="block text-sm font-medium mb-1">
            Owed <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={entry.owed}
            onChange={(e) => handleChange('owed', parseFloat(e.target.value) || 0)}
            onBlur={(e) => handleBlur('owed', parseFloat(e.target.value) || 0)}
            className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-900 ${errors.owed
              ? 'border-red-500 focus:ring-2 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-700'
              }`}
          />
          {errors.owed && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.owed}</span>
            </div>
          )}
        </div>

        {/* Deposited */}
        <div className="w-full">
          <label className="block text-sm font-medium mb-1">Deposited</label>
          <input
            type="number"
            min="0"
            value={entry.deposited}
            onChange={(e) => handleChange('deposited', parseFloat(e.target.value) || 0)}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
          />
        </div>

        {/* Date */}
        <div className="w-full">
          <label className="block text-sm font-medium mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={entry.date}
            onChange={(e) => handleChange('date', e.target.value)}
            onBlur={(e) => handleBlur('date', e.target.value)}
            className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-900 ${errors.date
              ? 'border-red-500 focus:ring-2 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-700'
              }`}
          />
          {errors.date && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.date}</span>
            </div>
          )}
        </div>
      </div>

      {/* Global Error Message */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              Please fix the following errors:
            </p>
            <ul className="text-xs text-red-600 dark:text-red-300 mt-1 list-disc list-inside">
              {Object.values(errors).map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Unique Product Product IDs */}
      {isUnique && (
        <div className="mt-6">
          <DeviceIdSection
            entry={entry}
            index={index}
            onChange={onChange}
            onRemoveDevice={onRemoveDevice}
            onAddDeviceRow={() => onAddDeviceRow(index)}
            onOpenScanner={(deviceIndex) => onOpenScanner(index, deviceIndex)}
          />
        </div>
      )}

      {/* Non-Unique Info */}
      {!isUnique && entry.dynamic_product_id && (
        <p className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold rounded-lg text-center text-sm">
          ✅ Non-Unique Product – Total Owed is Price × Quantity
        </p>
      )}
    </div>
  );
}

// Searchable Product Dropdown Component
function SearchableProductDropdown({ products, selectedProductId, onSelect, onBlur, hasError }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Get selected product name
  const selectedProduct = products.find(p => String(p.id) === String(selectedProductId));

  // Filter products based on search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
        if (onBlur) onBlur(selectedProductId);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedProductId, onBlur]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (productId) => {
    onSelect(productId);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-900 text-sm text-left flex items-center justify-between gap-2 ${hasError ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'
          }`}
      >
        <span className={selectedProduct ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
          {selectedProduct ? `${selectedProduct.name} (${selectedProduct.selling_price || 0})` : 'Select Product'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No products found
              </div>
            ) : (
              filteredProducts.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p.id)}
                  className={`w-full px-3 py-2.5 text-sm text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center justify-between ${String(p.id) === String(selectedProductId) ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-700 dark:text-gray-300'
                    }`}
                >
                  <span className="truncate">{p.name}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{p.selling_price || 0}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Searchable Customer Dropdown Component
function SearchableCustomerDropdown({ customers, selectedCustomerId, onSelect, onBlur, hasError }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Get selected customer name
  const selectedCustomer = customers.find(c => String(c.id) === String(selectedCustomerId));

  // Filter customers based on search (name or email)
  const filteredCustomers = customers.filter(c => {
    const lowerSearch = search.toLowerCase();
    const nameMatch = c.fullname?.toLowerCase().includes(lowerSearch);
    const emailMatch = c.email?.toLowerCase().includes(lowerSearch);
    return nameMatch || emailMatch;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
        if (onBlur) onBlur(selectedCustomerId);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCustomerId, onBlur]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (customerId) => {
    onSelect(customerId);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-900 text-sm text-left flex items-center justify-between gap-2 ${hasError ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'
          }`}
      >
        <span className={selectedCustomer ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
          {selectedCustomer ? selectedCustomer.fullname : 'Select Customer'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No customers found
              </div>
            ) : (
              filteredCustomers.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c.id)}
                  className={`w-full px-3 py-2.5 text-sm text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex flex-col ${String(c.id) === String(selectedCustomerId) ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-700 dark:text-gray-300'
                    }`}
                >
                  <span className="truncate font-medium">{c.fullname}</span>
                  {c.email && (
                    <span className="text-xs text-gray-500">{c.email}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}