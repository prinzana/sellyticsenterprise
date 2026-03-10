/**
 * Receipt QR Modal - Compact, intuitive design
 */
import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Printer, Share2, Copy } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import ReceiptPreview from './ReceiptPreview';

export default function ReceiptQRModal({
  isOpen,
  onClose,
  receipt,
  saleGroup,
  store,
  productGroups,
  styles,
  currentPlan,
  onLock
}) {
  const printRef = useRef();

  const qrCodeUrl = receipt ? `${window.location.origin}/receipt/${receipt.receipt_id}` : '';

  const generatePDF = async () => {
    const element = printRef.current;
    if (currentPlan === 'FREE') {
      onLock('feature_locked');
      return;
    }
    const toastId = toast.loading('Generating PDF...');

    try {
      const canvas = await html2canvas(element, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.9);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 297]
      });

      const imgWidth = 80;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`receipt-${receipt.receipt_id}.pdf`);

      toast.success('PDF downloaded', { id: toastId });
    } catch (error) {
      console.error('PDF error:', error);
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyLink = () => {
    if (currentPlan === 'FREE') {
      onLock('feature_locked');
      return;
    }
    navigator.clipboard.writeText(qrCodeUrl);
    toast.success('Link copied');
  };

  const shareLink = async () => {
    if (currentPlan === 'FREE') {
      onLock('feature_locked');
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt ${receipt.receipt_id}`,
          url: qrCodeUrl
        });
      } catch (err) {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Receipt Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-180px)]">
            {/* QR Code Section */}
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
              <div className="text-center space-y-3">
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  Scan to view online
                </p>
                <div className="bg-white p-4 rounded-2xl inline-block shadow-lg">
                  <QRCodeCanvas value={qrCodeUrl} size={160} />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={copyLink}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm ${currentPlan === 'FREE' ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-75' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </button>
                  <button
                    onClick={shareLink}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm ${currentPlan === 'FREE' ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-75' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Receipt Preview */}
            <div className="p-6">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 text-center">
                Receipt Preview
              </p>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <ReceiptPreview
                  ref={printRef}
                  store={store}
                  receipt={receipt}
                  saleGroup={saleGroup}
                  productGroups={productGroups}
                  styles={styles}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 p-5 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={generatePDF}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${currentPlan === 'FREE' ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30'}`}
            >
              <Download className="w-5 h-5" />
              Download
              {currentPlan === 'FREE' && (
                <svg className="w-3 h-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}