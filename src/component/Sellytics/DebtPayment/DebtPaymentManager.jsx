// src/components/Debt/DebtPaymentManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { toast } from 'react-toastify';
import { getUserPermission } from '../../../utils/accessControl';
import { useCurrency } from '../../context/currencyContext';
import DebtListItem from './DebtListItem';
import RecordPaymentModal from './RecordPaymentModal';
import PaymentHistoryModal from './PaymentHistoryModal';
import SearchInput from '../ui/SearchInput';

export default function DebtPaymentManager() {
  const storeId = localStorage.getItem('store_id');
  const userEmail = localStorage.getItem('user_email') || '';

  const { formatPrice } = useCurrency();

  const [debts, setDebts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({ canDelete: false, canEdit: true });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);

  // Fetch debts
  const fetchDebts = useCallback(async () => {
    if (!storeId) return;
    const { data, error } = await supabase
      .from('debt_tracker')
      .select('id, customer_id, amount_owed, customer(fullname)')
      .eq('store_id', storeId);

    if (error) toast.error('Failed to load debts');
    else setDebts(data || []);
  }, [storeId]);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    if (!storeId) return;
    const { data, error } = await supabase
      .from('debt_payment_history')
      .select('*')
      .eq('store_id', storeId);

    if (error) toast.error('Failed to load payments');
    else setPayments(data || []);
  }, [storeId]);

  // Load permissions
  useEffect(() => {
    if (storeId && userEmail) {
      getUserPermission(storeId, userEmail).then(setPermissions);
    }
  }, [storeId, userEmail]);

  // Load data
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDebts(), fetchPayments()]).finally(() => setLoading(false));
  }, [fetchDebts, fetchPayments]);

  // Compute enriched debts
  const enrichedDebts = debts.map((debt) => {
    const history = payments.filter((p) => p.debt_tracker_id === debt.id);
    const paid = history.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
    const remaining = Number(debt.amount_owed || 0) - paid;

    return {
      ...debt,
      customer_name: debt.customer?.fullname || 'Unknown',
      paid,
      remaining,
      status: remaining <= 0 ? 'paid' : paid > 0 ? 'partial' : 'owing',
      payment_history: history,
    };
  }).filter((d) =>
    d.customer_name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.remaining - a.remaining); // Owing first

  if (!storeId) {
    return <div className="text-center py-12 text-red-600 text-2xl">No store selected</div>;
  }

  return (
    <div className="w-full space-y-6">

      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search customer..."
      />

      {/* Loading / Empty */}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading debts...</div>
      ) : enrichedDebts.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-xl font-medium">No debts found</p>
        </div>
      ) : (
        <div className="-mx-4 sm:mx-0 flex flex-col border-y border-slate-200 dark:border-slate-800 sm:border-y-0 sm:space-y-4 pb-4 sm:pb-0">
          {enrichedDebts.map((debt) => (
            <DebtListItem
              key={debt.id}
              debt={debt}
              formatPrice={formatPrice}
              onRecordPayment={() => {
                setSelectedDebt(debt);
                setShowPaymentModal(true);
              }}
              onViewHistory={() => {
                setSelectedDebt(debt);
                setShowHistoryModal(true);
              }}
              canDelete={permissions.canDelete}
              onDelete={async () => {
                if (!window.confirm(`Delete debt for ${debt.customer_name}?`)) return;
                await supabase.from('debt_tracker').delete().eq('id', debt.id);
                toast.success('Debt deleted');
                fetchDebts();
                fetchPayments();
              }}
            />
          ))}
        </div>
      )}
      {/* Modals */}
      {showPaymentModal && selectedDebt && (
        <RecordPaymentModal
          debt={selectedDebt}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            fetchDebts();
            fetchPayments();
          }}
        />
      )}

      {showHistoryModal && selectedDebt && (
        <PaymentHistoryModal
          debt={selectedDebt}
          onClose={() => setShowHistoryModal(false)}
          onUpdate={() => {
            fetchDebts();
            fetchPayments();
          }}
          canEdit={permissions.canEdit}
          canDelete={permissions.canDelete}
        />
      )}
    </div>
  );
}