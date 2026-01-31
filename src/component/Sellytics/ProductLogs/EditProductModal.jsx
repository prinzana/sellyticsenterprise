// EditProductModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useScanner from './hooks/useScanner';
import ScannerModal from './ScannerModal';
import ProductItemForm from './ProductItemForm';

export default function EditProductModal({
  product,
  isStoreOwner,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ permission
  const canRemoveExistingImeis = isStoreOwner === true;

  /* ---------------- Scanner ---------------- */
  const scanner = useScanner({
    onScanItem: (item) => {
      if (!form || !form.is_unique) return;
      if (form.deviceIds.includes(item.code)) return;

      setForm(prev => ({
        ...prev,
        deviceIds: [...prev.deviceIds.filter(Boolean), item.code, ''],
        deviceSizes: [...prev.deviceSizes.filter(Boolean), '', ''],
      }));
    },
    onScanComplete: (scannedItems) => {
      if (!form) return;

      if (!form.is_unique && scannedItems.length > 0) {
        setForm(prev => ({
          ...prev,
          device_id: scannedItems[0].code,
          restock_qty: String(scannedItems.length),
        }));
      }
    },
  });

  /* ---------------- Load product ---------------- */
  useEffect(() => {
    if (!product) return;

    const isUnique = product.is_unique;

    const existingIds =
      isUnique && product.dynamic_product_imeis
        ? product.dynamic_product_imeis.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const existingSizes =
      isUnique && product.device_size
        ? product.device_size.split(',').map(s => s.trim())
        : Array(existingIds.length).fill('');

    setForm({
      ...product,
      is_unique: isUnique,
      deviceIds: isUnique ? [...existingIds, ''] : [],
      deviceSizes: isUnique ? [...existingSizes, ''] : [],
      existingCount: existingIds.length,
      restock_qty: '',
    });
  }, [product]);

  /* ---------------- Save ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Product name is required');

    const userEmail = localStorage.getItem('user_email');

    let payload = {};
    let inventoryDelta = 0;

    if (form.is_unique) {
      const ids = form.deviceIds.filter(Boolean);

      if (!ids.length) return toast.error('At least one unique ID required');
      if (new Set(ids.map(id => id.toLowerCase())).size < ids.length)
        return toast.error('Duplicate IDs found');

      payload = {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        suppliers_name: form.suppliers_name?.trim() || null,
        purchase_price: Number(form.purchase_price) || 0,
        selling_price: Number(form.selling_price) || 0,
        purchase_qty: ids.length,
        is_unique: true,
        dynamic_product_imeis: ids.join(','),
        device_size: form.deviceSizes.slice(0, ids.length).join(','),
        device_id: null,
        updated_by_email: userEmail,
      };

      inventoryDelta = ids.length - form.existingCount;
    } else {
      const restockQty = Number(form.restock_qty) || 0;

      payload = {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        suppliers_name: form.suppliers_name?.trim() || null,
        purchase_price: Number(form.purchase_price) || 0,
        selling_price: Number(form.selling_price) || 0,
        purchase_qty: Number(form.purchase_qty) + restockQty,
        is_unique: false,
        device_id: form.device_id?.trim() || null,
        device_size: form.device_size?.trim() || null,
        dynamic_product_imeis: null,
        updated_by_email: userEmail,
      };

      inventoryDelta = restockQty;
    }

    try {
      setSubmitting(true);
      await onSave(form.id, payload, inventoryDelta);
      onClose();
    } catch (err) {
      toast.error('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (!form) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.form
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10 mb-4">
            <h2 className="text-2xl font-bold">Edit Product</h2>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <ProductItemForm
            product={form}
            productIndex={0}
            productsLength={1}
            canRemoveExistingImeis={canRemoveExistingImeis} // ✅ KEY
            setProducts={(updater) =>
              setForm(prev => prev ? updater([prev])[0] : prev)
            }
            onOpenScanner={() =>
              scanner.openScanner(form.is_unique ? 'unique' : 'standard', 'camera')
            }
            onRemoveProduct={() => { }}
          />

          {/* Footer */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.form>
      </motion.div>

      {/* Scanner - Only render when showScanner is true */}
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
          onManualSubmit={scanner.handleManualSubmit}
          scannedItems={scanner.scannedItems}
          removeScannedItem={scanner.removeScannedItem}
          updateScannedItemSize={scanner.updateScannedItemSize}
          completeScanning={scanner.completeScanning}
          onClose={scanner.closeScanner}
          scanningFor={scanner.scanningFor}
          processScannedCode={scanner.processScannedCode}
        />
      )}
    </>
  );
}
