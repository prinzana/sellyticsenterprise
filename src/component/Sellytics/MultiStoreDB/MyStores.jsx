import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import {
  FaStore,
  FaPlus,
  FaSearch,
  FaLock,
} from 'react-icons/fa';
import { Phone, Mail, MapPin, AlertTriangle } from 'lucide-react';
import AddStoreModal from './AddStoreModal';

import { PLANS, getStoreLimit, getEffectivePlan } from '../../../utils/planManager';

export default function MyStores() {
  const navigate = useNavigate();
  const ownerId = Number(localStorage.getItem('owner_id'));
  const [stores, setStores] = useState([]);
  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(PLANS.FREE);

  const fetchStores = useCallback(async () => {
    if (!ownerId) {
      setError('No owner_id found. Please log in again.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch owner name, subscription & registration date
      const [ownerRes, subRes] = await Promise.all([
        supabase.from('store_owners').select('full_name, created_at').eq('id', ownerId).single(),
        supabase.rpc('get_owner_subscription', { p_owner_id: ownerId })
      ]);

      if (ownerRes.error) throw ownerRes.error;
      setOwnerName(ownerRes.data.full_name);
      const ownerRegistrationDate = ownerRes.data.created_at;

      const subData = subRes.data?.[0];
      setSubscription(subData || null);

      // 1. Fetch any store from this owner to get a reference creation date if needed
      const { data: storesData } = await supabase
        .from('stores')
        .select('id, plan, created_at')
        .eq('owner_user_id', ownerId)
        .order('created_at', { ascending: true })
        .limit(1);

      const oldestStore = storesData?.[0];

      // 2. Determine effective plan using centralized logic
      // Fallback order: Explicit Sub > Oldest Store Date > Owner Registration Date
      const effective = getEffectivePlan(
        oldestStore?.plan || PLANS.FREE,
        subData || oldestStore?.created_at || ownerRegistrationDate
      );
      
      setCurrentPlan(effective);

      // Fetch stores
      const { data, error: storesErr } = await supabase
        .from('stores')
        .select('id, shop_name, physical_address, phone_number, email_address, is_active, nature_of_business')
        .eq('owner_user_id', ownerId)
        .order('created_at', { ascending: false });
      if (storesErr) throw storesErr;
      setStores(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Filter stores
  const filtered = stores.filter(store =>
    store.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (store.physical_address || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-56 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  const storeLimit = getStoreLimit(currentPlan, subscription);
  const isInfiniteStores = storeLimit === Infinity;
  const isStoreLimitReached = !isInfiniteStores && stores.length >= storeLimit;

  return (
    <div className="space-y-6">
      {/* ─── HEADER ──────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Stores</h2>
          <p className="text-slate-500 text-sm">
            {stores.length} of {isInfiniteStores ? 'Unlimited' : storeLimit} store{storeLimit !== 1 ? 's' : ''} under <span className="font-bold text-indigo-600">{ownerName}</span>
          </p>
          {/* Limit progress bar */}
          <div className="mt-2 flex items-center gap-3">
            <div className="w-40 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isInfiniteStores ? 'bg-emerald-500' : isStoreLimitReached ? 'bg-red-500' : stores.length >= storeLimit - 1 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                style={{ width: `${isInfiniteStores ? 100 : Math.min((stores.length / storeLimit) * 100, 100)}%` }}
              />
            </div>
            <span className={`text-xs font-bold ${isStoreLimitReached ? 'text-red-500' : 'text-slate-400'
              }`}>
              {stores.length}/{isInfiniteStores ? '∞' : storeLimit} slots
            </span>
          </div>
        </div>

        {isStoreLimitReached ? (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-bold text-sm cursor-not-allowed" title="Store limit reached">
            <FaLock size={12} /> Limit Reached ({storeLimit})
          </div>
        ) : (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 font-bold text-sm"
          >
            <FaPlus size={12} /> Add New Store
          </button>
        )}
      </div>

      {/* Limit warning banner */}
      {isStoreLimitReached && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Store limit reached.</strong> Your plan allows a maximum of {storeLimit} stores. Contact support or upgrade for more.
          </p>
        </div>
      )}

      {/* ─── SEARCH ──────────────────── */}
      {stores.length > 0 && (
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-all font-medium"
          />
        </div>
      )}

      {/* ─── EMPTY STATE ─────────────── */}
      {filtered.length === 0 && !searchTerm && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaStore className="text-4xl text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Stores Yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            Add your first store to start managing your business.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <FaPlus /> Create Your First Store
          </button>
        </div>
      )}

      {filtered.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-slate-500 font-medium">No stores match "{searchTerm}"</p>
        </div>
      )}

      {/* ─── STORES GRID ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(store => (
          <div
            key={store.id}
            onClick={() => {
              localStorage.setItem('store_id', store.id);
              navigate('/dashboard');
              window.location.reload();
            }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
          >
            {/* Accent bar */}
            <div className={`absolute top-0 left-0 w-1 h-full ${store.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />

            <div className="p-6">
              {/* Status badge */}
              <span
                className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${store.is_active
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
              >
                {store.is_active ? 'Active' : 'Inactive'}
              </span>

              {/* Store icon + name */}
              <div className="flex items-start gap-3 mb-4 pr-16">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                  <FaStore className="text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    {store.shop_name}
                  </h3>
                  {store.nature_of_business && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {store.nature_of_business}
                    </span>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                  <span className="line-clamp-2">{store.physical_address || 'No address set'}</span>
                </div>
                {store.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{store.phone_number}</span>
                  </div>
                )}
                {store.email_address && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{store.email_address}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">ID: #{store.id}</span>
                <span className="text-xs font-bold text-indigo-500 group-hover:text-indigo-700 transition-colors">
                  Open Dashboard →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── ADD STORE MODAL ─────────── */}
      <AddStoreModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStoreAdded={() => fetchStores()}
        ownerId={ownerId}
        ownerName={ownerName}
      />
    </div>
  );
}
