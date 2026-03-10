/**
 * ReceiptViewModal.jsx - Custom modal (no external UI library)
 * Pops up when a sale group is clicked
 */
import React, { useState } from 'react';
import { X, Edit2, QrCode, Download, Trash2, Save, ArrowLeft } from 'lucide-react';
import ReceiptPreview from './ReceiptPreview'; // Your existing receipt print preview
import ReceiptQRModal from './ReceiptQRModal'; // Keep your existing QR modal
import toast from 'react-hot-toast';
export default function ReceiptViewModal({
  isOpen,
  onClose,
  receipt,
  saleGroup,
  store,
  productGroups,
  onDeleteEntireSale,
  styles,
  onUpdate,
  onDownloadPDF,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: receipt?.customer_name || '',
    phone_number: receipt?.phone_number || '',
    warranty: receipt?.warranty || '',
    customer_address: receipt?.customer_address || '',
  });

  // FIXED: Only check isOpen and saleGroup
  if (!isOpen) return null;
  if (!saleGroup) return null;


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
    toast.success('Receipt updated successfully');
  };

  const handleCancelEdit = () => {
    setFormData({
      customer_name: receipt.customer_name || '',
      phone_number: receipt.phone_number || '',
      warranty: receipt.warranty || '',
      customer_address: receipt.customer_address || '',
    });
    setIsEditing(false);
  };

  const handleShare = () => {
    // Simple browser share if supported, or fallback copy link
    if (navigator.share) {
      navigator.share({
        title: `Receipt ${receipt.receipt_id}`,
        text: `Receipt for sale #${saleGroup.id}`,
        url: window.location.href,
      }).catch(() => toast.error('Sharing failed'));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this receipt? This cannot be undone.')) {
      onDelete();
      onClose();
      toast.success('Receipt deleted');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Receipt #{receipt.receipt_id || saleGroup.id}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Receipt Preview */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <ReceiptPreview
                store={store}
                receipt={receipt}
                saleGroup={saleGroup}
                productGroups={productGroups}
                styles={styles}
              />
            </div>

            {/* Customer Info & Edit Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Details</h3>

              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Customer Name</label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input
                      type="text"
                      name="customer_address"
                      value={formData.customer_address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Warranty</label>
                    <input
                      type="text"
                      name="warranty"
                      value={formData.warranty}
                      onChange={handleInputChange}
                      placeholder="e.g. 1 year"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Customer:</span> {receipt.customer_name || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {receipt.phone_number || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Address:</span> {receipt.customer_address || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Warranty:</span> {receipt.warranty || '-'}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center pt-6 border-t border-slate-200 dark:border-slate-700">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-5 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 rounded-xl font-medium transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Details
                  </button>

                  <button
                    onClick={() => setShowQR(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-xl font-medium transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    View QR
                  </button>

                  <button
                    onClick={() => onDownloadPDF(receipt)}
                    className="flex items-center gap-2 px-5 py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-xl font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>

                  <button
                    onClick={onDelete} // This calls deleteReceiptOnly → safe, no recreate
                    className="flex items-center gap-2 px-5 py-3 bg-red-100 ...">
                    <Trash2 className="w-4 h-4" />
                    Delete Receipt Only
                  </button>

                  {/* Optional: Add full delete */}
                  <button
                    onClick={onDeleteEntireSale}
                    className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white ...">
                    <Trash2 className="w-4 h-4" />
                    Delete Entire Sale
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nested QR Modal */}
      <ReceiptQRModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        receipt={receipt}
        saleGroup={saleGroup}
        store={store}
        productGroups={productGroups}
        styles={styles}
      />
    </>
  );
}