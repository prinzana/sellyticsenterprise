import React, { useState } from 'react';
import { Search, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import useReceiptManager from './useReceiptManager';
import useReceiptCustomization from './useReceiptCustomization';
import SaleGroupsTable from './SaleGroupsTable';
import ReceiptsTable from './ReceiptsTable';
import ReceiptEditModal from './ReceiptEditModal';
import ReceiptQRModal from './ReceiptQRModal';
import ReceiptCustomizer from './ReceiptCustomizer';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { supabase } from '../../../supabaseClient';
import { PLANS } from '../../../utils/planManager';
import UpgradePlanModal from '../Shared/UpgradePlanModal';

export default function ReceiptsPage() {
  const storeId = localStorage.getItem('store_id');
  const userEmail = localStorage.getItem('user_email');

  const [searchTerm, setSearchTerm] = useState('');
  const [showSaleGroups, setShowSaleGroups] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(PLANS.FREE);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('feature_locked');

  const {
    store,
    filteredSaleGroups,
    selectedSaleGroup,
    setSelectedSaleGroup,
    filteredReceipts,
    canDelete,
    loading,
    updateReceipt,
    deleteReceipt,
    getProductGroups,
    refreshReceipts
  } = useReceiptManager(storeId, userEmail);

  const { styles, updateStyle, resetStyles } = useReceiptCustomization();

  // Apply search filter on top of permission-filtered saleGroups
  const searchFilteredSaleGroups = filteredSaleGroups.filter(sg => {
    const term = searchTerm.toLowerCase();
    return (
      `#${sg.id}`.includes(term) ||
      sg.total_amount?.toString().includes(term) ||
      sg.payment_method?.toLowerCase().includes(term)
    );
  });

  const searchFilteredReceipts = filteredReceipts.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      r.receipt_id?.toLowerCase().includes(term) ||
      r.customer_name?.toLowerCase().includes(term) ||
      r.phone_number?.includes(term) ||
      `#${r.sale_group_id}`.includes(term)
    );
  });

  // Fetch Plan
  React.useEffect(() => {
    const fetchPlan = async () => {
      const ownerId = localStorage.getItem('owner_id');
      if (ownerId) {
        try {
          const { data, error } = await supabase.rpc('get_owner_subscription', { p_owner_id: Number(ownerId) });
          if (!error && data?.[0]) {
            const sub = data[0];
            if (sub.status === 'active' || (sub.status === 'trialing' && sub.trial_end && new Date(sub.trial_end) > new Date())) {
              setCurrentPlan(sub.plan_name || PLANS.BUSINESS);
            }
          }
        } catch (err) {
          console.error('Plan fetch error:', err);
        }
      }
    };
    fetchPlan();
  }, [storeId]);

  const handleApplyLock = (reason = 'feature_locked') => {
    setUpgradeReason(reason);
    setShowUpgradeModal(true);
  };

  const handleDownloadPDF = async (receipt) => {
    const toastId = toast.loading('Generating PDF...');

    try {
      // Create temporary element for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      // Use React to render ReceiptPreview
      const { default: ReceiptPreview } = await import('./ReceiptPreview');
      const { createRoot } = await import('react-dom/client');

      const root = createRoot(tempDiv);
      const productGroups = getProductGroups();

      root.render(
        React.createElement(ReceiptPreview, {
          store,
          receipt,
          saleGroup: selectedSaleGroup,
          productGroups,
          styles
        })
      );

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.8);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200]
      });

      const imgWidth = 80;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`receipt-${receipt.receipt_id}.pdf`);

      // Cleanup
      root.unmount();
      document.body.removeChild(tempDiv);

      toast.success('PDF downloaded', { id: toastId });
    } catch (error) {
      console.error('PDF error:', error);
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

  if (!storeId || !userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-600 dark:text-slate-400">
            {!storeId ? 'No store selected' : 'User not logged in'}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Receipt Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {store?.shop_name || 'Store'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ReceiptCustomizer
                styles={styles}
                onUpdate={updateStyle}
                onReset={resetStyles}
                currentPlan={currentPlan}
                onLock={handleApplyLock}
              />
              <button
                onClick={() => setShowSaleGroups(!showSaleGroups)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                {showSaleGroups ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                {showSaleGroups ? 'Hide' : 'Show'} Sale Groups
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search receipts by ID, customer, phone..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Sale Groups */}
          {showSaleGroups && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Sales
              </h2>
              <SaleGroupsTable
                saleGroups={searchFilteredSaleGroups}
                selectedGroup={selectedSaleGroup}
                onSelectGroup={setSelectedSaleGroup}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* Receipts */}
          {selectedSaleGroup && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Sales Receipt #{selectedSaleGroup.id}
              </h2>
              <ReceiptsTable
                receipts={searchFilteredReceipts}
                onEdit={setEditingReceipt}
                onViewQRCode={setViewingReceipt}
                onDownloadPDF={handleDownloadPDF}
                onDelete={deleteReceipt}
                storeId={storeId}
                userEmail={userEmail}
                canDelete={canDelete}
                currentPlan={currentPlan}
                onLock={handleApplyLock}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ReceiptEditModal
        isOpen={!!editingReceipt}
        onClose={() => setEditingReceipt(null)}
        receipt={editingReceipt}
        onSave={async (updated) => {
          await updateReceipt(updated.id, updated);
          await refreshReceipts();
          setEditingReceipt(null);
        }}
      />

      <ReceiptQRModal
        isOpen={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        receipt={viewingReceipt}
        saleGroup={selectedSaleGroup}
        store={store}
        productGroups={getProductGroups()}
        styles={styles}
        currentPlan={currentPlan}
        onLock={handleApplyLock}
      />

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
        reason={upgradeReason}
      />
    </>
  );
}