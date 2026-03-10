import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Puzzle,
  Trash2,
  Search,
  CheckSquare,
  Square,

  Zap,
  RefreshCcw,
  X,
  Plus,
  ArrowRight,
  ShieldAlert,
  Settings2,
  Cpu
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FeatureAssignment = () => {
  const [stores, setStores] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStores, setSelectedStores] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const featureOptions = [
    { value: 'sales', label: 'Sales Tracker' },
    { value: 'products', label: 'Products & Pricing' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'receipts', label: 'Receipts' },
    { value: 'returns', label: 'Returns' },
    { value: 'expenses', label: 'Expenses' },
    { value: 'unpaid supplies', label: 'Unpaid Supplies' },
    { value: 'debts', label: 'Debtors' },
    { value: 'Suppliers', label: 'Suppliers' },
    { value: 'customers', label: 'Customers' },
    { value: 'sales_summary', label: 'Summary' },
    { value: 'stock_transfer', label: 'Transfer' },
    { value: 'financials', label: 'Financials' },
  ];

  const normalizeFeatures = useCallback((features) => {
    try {
      if (Array.isArray(features)) return features;
      if (typeof features === 'string') return JSON.parse(features) || [];
      return [];
    } catch (e) { return []; }
  }, []);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('stores')
      .select('id, shop_name, allowed_features')
      .order('id', { ascending: true });

    if (!error) {
      const normalized = data.map(s => ({ ...s, allowed_features: normalizeFeatures(s.allowed_features) }));
      setStores(normalized);
      setFiltered(normalized);
    } else {
      toast.error('Failed to synchronize capability registry');
    }
    setIsLoading(false);
  }, [normalizeFeatures]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      stores.filter(s =>
        s.shop_name?.toLowerCase().includes(q) ||
        String(s.id).includes(q)
      )
    );
  }, [search, stores]);

  const handleStoreSelect = (storeId) => {
    setSelectedStores(prev =>
      prev.includes(storeId) ? prev.filter(id => id !== storeId) : [...prev, storeId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStores.length === filtered.length) setSelectedStores([]);
    else setSelectedStores(filtered.map(s => s.id));
  };

  const handleFeatureToggle = (value) => {
    setSelectedFeatures(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const updateFeatures = async (action) => {
    if (selectedStores.length === 0 || selectedFeatures.length === 0) {
      toast.warn('Protocol requires active entity and module selection');
      return;
    }

    setIsLoading(true);
    try {
      for (const storeId of selectedStores) {
        const store = stores.find(s => s.id === storeId);
        const current = store.allowed_features || [];

        let updated;
        if (action === 'assign') {
          updated = [...new Set([...current, ...selectedFeatures])];
        } else {
          updated = current.filter(f => !selectedFeatures.includes(f));
        }

        await supabase
          .from('stores')
          .update({ allowed_features: updated })
          .eq('id', storeId);
      }
      toast.success(`Capabilities ${action === 'assign' ? 'integrated' : 'decoupled'} successfully`);
      setSelectedStores([]);
      setSelectedFeatures([]);
      fetchStores();
    } catch (err) {
      toast.error('Integration failure');
    } finally {
      setIsLoading(false);
    }
  };

  const massOperation = async (type) => {
    setIsLoading(true);
    try {
      const allFeatures = featureOptions.map(f => f.value);
      const value = type === 'all' ? allFeatures : [];
      for (const store of stores) {
        await supabase.from('stores').update({ allowed_features: value }).eq('id', store.id);
      }
      toast.success(type === 'all' ? 'Global provisioning complete' : 'Global reset complete');
      fetchStores();
    } catch (err) {
      toast.error('Global operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const removeSingle = async (storeId, feature) => {
    setIsLoading(true);
    const store = stores.find(s => s.id === storeId);
    const updated = store.allowed_features.filter(f => f !== feature);

    const { error } = await supabase.from('stores').update({ allowed_features: updated }).eq('id', storeId);
    if (!error) {
      toast.success(`Revoked ${feature} capability`);
      fetchStores();
    } else {
      toast.error('Partial revocation failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="bottom-right" theme="dark" />

      {/* Strategic Control Center */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Search & Bulk Select */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Entity Selection</h3>
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 rounded-lg border border-slate-100 dark:border-slate-700 transition-all active:scale-95"
              >
                {selectedStores.length === filtered.length ? <CheckSquare size={12} /> : <Square size={12} />}
                {selectedStores.length === filtered.length ? 'Deselect Registry' : 'Select All'}
              </button>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Synchronize with entity name or system ID..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl text-sm transition-all outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Feature Grid Selector */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Module Capability Provisioning</h3>
            <div className="flex flex-wrap gap-1.5">
              {featureOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleFeatureToggle(opt.value)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${selectedFeatures.includes(opt.value)
                    ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-600/20 active:scale-95'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <Cpu size={10} fill={selectedFeatures.includes(opt.value) ? "currentColor" : "none"} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-wrap gap-3">
          <button
            onClick={() => updateFeatures('assign')}
            disabled={isLoading}
            className="flex-1 min-w-[160px] py-4 bg-indigo-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/10 hover:bg-indigo-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            <Zap size={16} /> Integrate Features
          </button>
          <button
            onClick={() => updateFeatures('revoke')}
            disabled={isLoading}
            className="flex-1 min-w-[160px] py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            <ShieldAlert size={16} /> Decouple Modules
          </button>

          <div className="w-full md:w-auto flex gap-2">
            <button
              onClick={() => massOperation('all')}
              className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800/50 rounded-xl hover:bg-emerald-100 transition-all active:scale-95"
              title="Global Activation"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => massOperation('none')}
              className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-100 dark:border-red-800/50 rounded-xl hover:bg-red-100 transition-all active:scale-95"
              title="Global Deactivation"
            >
              <X size={20} />
            </button>
            <button
              onClick={fetchStores}
              className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all active:scale-95"
              title="Sync Registry"
            >
              <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Provisioning List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((store, idx) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              className={`group p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center gap-5 relative overflow-hidden bg-white dark:bg-slate-900 shadow-sm ${selectedStores.includes(store.id)
                ? 'border-indigo-500 shadow-indigo-500/10'
                : 'border-slate-100 dark:border-slate-800 hover:border-indigo-100'
                }`}
            >
              <div className="flex-1 flex items-center gap-4 min-w-[240px]">
                <button
                  onClick={() => handleStoreSelect(store.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${selectedStores.includes(store.id)
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-300'
                    }`}
                >
                  {selectedStores.includes(store.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
                <div className="min-w-0">
                  <h3 className="font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{store.shop_name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System ID: {String(store.id).slice(0, 8)}</p>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400/70 uppercase tracking-widest">
                      {store.allowed_features?.length || 0} Modules Integrated
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Capability Tags */}
              <div className="flex-[2] flex flex-wrap gap-1">
                {store.allowed_features?.map((f) => (
                  <div key={f} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-[9px] font-black uppercase text-indigo-900 dark:text-indigo-300 rounded-lg group/tag hover:bg-slate-100 transition-all border border-slate-100 dark:border-slate-700">
                    <span>{featureOptions.find(o => o.value === f)?.label || f}</span>
                    <button
                      onClick={() => removeSingle(store.id, f)}
                      className="p-1 hover:bg-red-500 hover:text-white rounded-md transition-colors"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                {(!store.allowed_features || store.allowed_features.length === 0) && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/30 text-slate-300 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                    <Settings2 size={10} />
                    <span className="text-[9px] font-bold uppercase tracking-widest italic">No Modules Discovered</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50 dark:border-slate-800">
                <button
                  onClick={() => handleStoreSelect(store.id)}
                  className={`p-3 rounded-xl transition-all ${selectedStores.includes(store.id) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300 group-hover:text-indigo-400'}`}
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && !isLoading && (
        <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-6">
            <Puzzle size={32} />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Registry Void</h3>
          <p className="text-slate-400 font-bold uppercase tracking-[0.1em] text-[10px]">No infrastructure nodes matched the sync query</p>
        </div>
      )}
    </div>
  );
};

export default FeatureAssignment;
