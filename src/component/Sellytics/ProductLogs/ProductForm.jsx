// components/ProductForm.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  X, Package, Plus, Loader2, WifiOff, Check
} from 'lucide-react';

import useScanner from './hooks/useScanner';
import ScannerModal from './ScannerModal';
import ProductItemForm from './ProductItemForm';

const initialProduct = {
  name: '',
  description: '',
  purchase_price: '',
  selling_price: '',
  purchase_qty: '1',
  suppliers_name: '',
  is_unique: false,
  device_id: '',
  device_size: '',
  deviceIds: [''],
  deviceSizes: [''],
};

export default function ProductForm({ onSave, onClose, isOnline }) {
  const [products, setProducts] = useState([{ ...initialProduct, id: Date.now() }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(null);


  const scanner = useScanner({
    // 🔥 fires on EVERY scan
    onScanItem: (item) => {
      if (currentProductIndex === null) return;

      setProducts(prev => {
        const updated = [...prev];
        const product = updated[currentProductIndex];

        if (!product.is_unique) return prev;

        // UI duplicate guard
        if (product.deviceIds.includes(item.code)) return prev;

        updated[currentProductIndex] = {
          ...product,
          deviceIds: [...product.deviceIds.filter(Boolean), item.code, ''],
          deviceSizes: [...product.deviceSizes.filter(Boolean), '', ''],
        };

        return updated;
      });
    },

    // ✅ final confirmation (non-unique OR Done button)
    onScanComplete: (scannedItems) => {
      if (currentProductIndex === null) return;

      setProducts(prev => {
        const updated = [...prev];
        const product = updated[currentProductIndex];

        if (!product.is_unique && scannedItems.length > 0) {
          updated[currentProductIndex] = {
            ...product,
            device_id: scannedItems[0].code,
            purchase_qty: String(scannedItems.length),
          };
        }

        return updated;
      });

      setCurrentProductIndex(null);
    }
  });


  const openScannerForProduct = (index) => {
    setCurrentProductIndex(index);
    const mode = products[index].is_unique ? 'unique' : 'standard';
    scanner.openScanner(mode, 'camera');
  };

  const addProduct = () => {
    setProducts(prev => [...prev, { ...initialProduct, id: Date.now() }]);
  };

  const removeProduct = (index) => {
    if (products.length === 1) return;
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  // Validation: Check if any unique item is missing at least one Product ID
  const uniqueItemsMissingIds = products.filter(
    p => p.is_unique && p.deviceIds.filter(Boolean).length === 0
  );
  const hasUniqueValidationError = uniqueItemsMissingIds.length > 0;


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Basic validation
    for (const p of products) {
      if (!p.name.trim()) return toast.error('Product name is required');
      if (p.is_unique && p.deviceIds.filter(Boolean).length === 0)
        return toast.error(`"${p.name}" needs at least one Product ID`);
      if (!p.is_unique && (!p.purchase_qty || Number(p.purchase_qty) <= 0))
        return toast.error(`"${p.name}" needs a valid quantity`);
      if (p.is_unique && new Set(p.deviceIds.filter(Boolean).map(id => id.toLowerCase())).size < p.deviceIds.filter(Boolean).length)
        return toast.error(`Duplicate Product IDs in "${p.name}"`);
    }

    const userEmail = localStorage.getItem('user_email'); // Grab here (safe, inside submit)

    setIsSubmitting(true);
    try {
      for (const product of products) {
        const payload = {
          name: product.name.trim(),
          description: product.description?.trim() || null,
          purchase_price: Number(product.purchase_price) || 0,
          selling_price: Number(product.selling_price) || 0,
          suppliers_name: product.suppliers_name?.trim() || null,
          is_unique: product.is_unique,
          created_by_email: userEmail || null, // ADD THIS LINE
        };

        if (product.is_unique) {
          const ids = product.deviceIds.filter(Boolean);
          payload.dynamic_product_imeis = ids.join(',');
          payload.device_size = product.deviceSizes.slice(0, ids.length).join(',') || null;
          payload.purchase_qty = ids.length;
          payload.device_id = null;
        } else {
          payload.purchase_qty = Number(product.purchase_qty) || 0;
          payload.device_id = product.device_id?.trim() || null;
          payload.device_size = product.device_size?.trim() || null;
          payload.dynamic_product_imeis = null;
        }

        await onSave(payload);
      }

      toast.success('Products saved successfully');
      onClose();
    } catch (err) {
      console.error(err);
      // Check if it's a duplicate product error - keep form open
      if (err.isDuplicate) {
        toast.error(err.message, { duration: 5000, icon: '⚠️' });
        // Don't close the form - let user update the name
        return;
      }
      toast.error(err.message || 'Failed to save products');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add Product</h2>
                {!isOnline && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <WifiOff className="w-3 h-3" />
                    Saving offline
                  </div>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
            {products.map((product, index) => (
              <ProductItemForm
                key={product.id}
                product={product}
                productIndex={index}
                productsLength={products.length}
                setProducts={setProducts}
                onOpenScanner={() => openScannerForProduct(index)}
                onRemoveProduct={removeProduct}
              />
            ))}

            <button
              type="button"
              onClick={addProduct}
              className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Another Product
            </button>

            {/* Footer */}
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              {/* Validation Warning */}
              {hasUniqueValidationError && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-700 dark:text-amber-400 text-sm">
                  <Package className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {uniqueItemsMissingIds.length === 1
                      ? `"${uniqueItemsMissingIds[0].name || 'Unique item'}" requires at least one Product ID`
                      : `${uniqueItemsMissingIds.length} unique items require at least one Product ID each`
                    }
                  </span>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || hasUniqueValidationError}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-900 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save {products.length > 1 ? `${products.length} Products` : 'Product'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {scanner.showScanner && (
        <ScannerModal
          show={scanner.showScanner}
          scannerMode={scanner.scannerMode}
          setScannerMode={scanner.setScannerMode}
          continuousScan={scanner.continuousScan}
          setContinuousScan={scanner.setContinuousScan}
          isLoading={scanner.isLoading}
          error={scanner.error}
          videoRef={scanner.videoRef}
          manualInput={scanner.manualInput}
          setManualInput={scanner.setManualInput}
          onScanSuccess={scanner.handleCameraScan}
          onManualSubmit={scanner.handleManualSubmit}
          scannedItems={scanner.scannedItems}
          removeScannedItem={scanner.removeScannedItem}
          updateScannedItemSize={scanner.updateScannedItemSize}
          completeScanning={scanner.completeScanning}
          onClose={scanner.closeScanner}
          scanningFor={scanner.scanningFor}
          onScanItem={(code) => scanner.onScanItem({ code })}
          onScanComplete={scanner.onScanComplete}
          processScannedCode={scanner.processScannedCode}

        />
      )}
    </>
  );
}