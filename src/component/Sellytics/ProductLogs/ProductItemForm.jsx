// components/ProductItemForm.jsx
import React from 'react';
import { Trash2, Plus, Camera } from 'lucide-react';

export default function ProductItemForm({
  product,
  productIndex,
  productsLength,
  setProducts,
  onOpenScanner,
  onRemoveProduct,
}) {
  const updateField = (field, value) => {
    updateProduct(p => ({ ...p, [field]: value }));
  };

  const updateProduct = (updater) => {
    setProducts(prev => {
      const next = [...prev];
      next[productIndex] = updater(prev[productIndex]);
      return next;
    });
  };

  const toggleUnique = (checked) => {
    updateProduct(p => {
      if (checked) {
        return {
          ...p,
          is_unique: true,
          deviceIds: p.device_id ? [p.device_id, ''] : [''],
          deviceSizes: p.device_size ? [p.device_size, ''] : [''],
          device_id: '',
          device_size: '',
        };
      }

      return {
        ...p,
        is_unique: false,
        device_id: p.deviceIds?.[0] || '',
        device_size: p.deviceSizes?.[0] || '',
        purchase_qty: String(p.deviceIds?.filter(Boolean).length || 1),
        deviceIds: [''],
        deviceSizes: [''],
      };
    });
  };

  const updateDeviceId = (deviceIndex, value) => {
    updateProduct(p => {
      const newDeviceIds = [...p.deviceIds];
      newDeviceIds[deviceIndex] = value;
      return {
        ...p,
        deviceIds: newDeviceIds,
      };
    });
  };

  const updateDeviceSize = (deviceIndex, value) => {
    updateProduct(p => {
      const newDeviceSizes = [...p.deviceSizes];
      newDeviceSizes[deviceIndex] = value;
      return {
        ...p,
        deviceSizes: newDeviceSizes,
      };
    });
  };

  const addDeviceRow = () => {
    updateProduct(p => ({
      ...p,
      deviceIds: [...p.deviceIds, ''],
      deviceSizes: [...p.deviceSizes, ''],
    }));
  };

  const removeDeviceRow = (deviceIndex) => {
    updateProduct(p => {
      const ids = p.deviceIds.filter((_, i) => i !== deviceIndex);
      const sizes = p.deviceSizes.filter((_, i) => i !== deviceIndex);

      return {
        ...p,
        deviceIds: ids.length ? ids : [''],
        deviceSizes: sizes.length ? sizes : [''],
      };
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Header - Full Width */}
      {productsLength > 1 && (
        <div className="w-full flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
            Product {productIndex + 1} of {productsLength}
          </span>
          <button
            type="button"
            onClick={() => onRemoveProduct(productIndex)}
            className="text-red-600 hover:text-red-700 active:scale-95 transition-transform flex items-center gap-1.5 text-xs sm:text-sm font-medium"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="hidden xs:inline">Remove</span>
          </button>
        </div>
      )}

      {/* Content Container - Full Width with Responsive Padding */}
      <div className="w-full px-3.5 sm:px-5 md:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4">

        {/* Product Name */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Product Name *</label>
          <input
            type="text"
            placeholder="Enter product name"
            value={product.name}
            onChange={e => updateField('name', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Description</label>
          <textarea
            placeholder="Add product details (optional)"
            value={product.description}
            onChange={e => updateField('description', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl resize-none text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            rows={2}
          />
        </div>

        {/* Prices Grid - Responsive */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Purchase Price</label>
            <input
              type="number"
              placeholder="0.00"
              value={product.purchase_price}
              onChange={e => updateField('purchase_price', e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Selling Price *</label>
            <input
              type="number"
              placeholder="0.00"
              value={product.selling_price}
              onChange={e => updateField('selling_price', e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
          </div>
        </div>

        {/* Unique Toggle - Full Width */}
        <label className="w-full flex gap-3 p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg sm:rounded-xl cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors active:scale-95">
          <input
            type="checkbox"
            checked={product.is_unique}
            onChange={e => toggleUnique(e.target.checked)}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded flex-shrink-0 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 block">Unique Items</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Track IMEI / Serial Numbers</p>
          </div>
        </label>

        {/* UNIQUE ITEMS SECTION */}
        {product.is_unique && (
          <div className="space-y-2 sm:space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Device Details</span>
            </div>

            {product.deviceIds.map((id, i) => (
              <div key={i} className="flex flex-col xs:flex-row gap-2 items-stretch xs:items-center bg-slate-50 dark:bg-slate-700/50 p-2.5 sm:p-3 rounded-lg">
                {/* IMEI Input */}
                <input
                  type="text"
                  placeholder="IMEI / Serial"
                  value={id}
                  onChange={e => updateDeviceId(i, e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />

                {/* Size Input */}
                <input
                  type="text"
                  placeholder="Size"
                  value={product.deviceSizes[i] || ''}
                  onChange={e => updateDeviceSize(i, e.target.value)}
                  className="w-full xs:w-24 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />

                {/* Camera Button */}
                <button
                  type="button"
                  onClick={() => onOpenScanner(productIndex, i)}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center"
                  title="Scan IMEI"
                >
                  <Camera className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" />
                </button>

                {/* Delete Button */}
                {product.deviceIds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDeviceRow(i)}
                    className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition-all flex items-center justify-center"
                    title="Remove device"
                  >
                    <Trash2 className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-red-600" />
                  </button>
                )}
              </div>
            ))}

            {/* Add Another Button */}
            <button
              type="button"
              onClick={addDeviceRow}
              className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg font-medium text-sm sm:text-base active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Device
            </button>
          </div>
        )}

        {/* NON-UNIQUE ITEMS SECTION */}
        {!product.is_unique && (
          <div className="space-y-3 sm:space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Quantity Details</span>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Quantity</label>
              <input
                type="number"
                placeholder="0"
                value={product.purchase_qty}
                onChange={e => updateField('purchase_qty', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Barcode / SKU */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Barcode / SKU</label>
              <div className="flex gap-2 items-stretch">
                <input
                  type="text"
                  placeholder="Scan or enter barcode"
                  value={product.device_id}
                  onChange={e => updateField('device_id', e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => onOpenScanner(productIndex, null)}
                  className="w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg sm:rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center"
                  title="Scan barcode"
                >
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Size / Variant */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Size / Variant</label>
              <input
                type="text"
                placeholder="e.g., Large, Red, XL"
                value={product.device_size}
                onChange={e => updateField('device_size', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
