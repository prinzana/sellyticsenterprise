import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {

  Trash2,
  Search,
  CheckSquare,
  Square,
  Lock,
  Unlock,
  Zap,
  RefreshCcw,
  X,
  Plus,
  ArrowRight,
  Shield
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StoreAccess = () => {
  const [stores, setStores] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStores, setSelectedStores] = useState([]);
  const [selectedDashboards, setSelectedDashboards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const dashboardOptions = [
    { value: 'fix_scan', label: 'Fix Scan', color: 'indigo' },
    { value: 'flex_scan', label: 'Flex Scan', color: 'purple' },
    { value: 'ai_insights', label: 'AI Insights', color: 'emerald' },
    { value: 'admin_ops', label: 'Admin Ops', color: 'amber' },
  ];

  const fetchStores = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('stores')
      .select('id, shop_name, allowed_dashboard')
      .order('id', { ascending: true });

    if (!error) {
      setStores(data);
      setFiltered(data);
    } else {
      toast.error('Failed to synchronize store registry');
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchStores(); }, []);

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

  const handleDashboardToggle = (value) => {
    setSelectedDashboards(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const updateAccess = async (action) => {
    if (selectedStores.length === 0 || selectedDashboards.length === 0) {
      toast.warn('Protocol requires at least one store and one module selection');
      return;
    }

    setIsLoading(true);
    try {
      for (const storeId of selectedStores) {
        const store = stores.find(s => s.id === storeId);
        const current = store.allowed_dashboard ? store.allowed_dashboard.split(',').filter(Boolean) : [];

        let updated;
        if (action === 'assign') {
          updated = [...new Set([...current, ...selectedDashboards])];
        } else {
          updated = current.filter(d => !selectedDashboards.includes(d));
        }

        await supabase
          .from('stores')
          .update({ allowed_dashboard: updated.join(',') })
          .eq('id', storeId);
      }
      toast.success(`Access permissions ${action === 'assign' ? 'provisioned' : 'revoked'} successfully`);
      setSelectedStores([]);
      setSelectedDashboards([]);
      fetchStores();
    } catch (err) {
      toast.error('Strategic update failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const massOperation = async (type) => {
    setIsLoading(true);
    try {
      const allDashboards = dashboardOptions.map(d => d.value).join(',');
      const value = type === 'all' ? allDashboards : '';

      for (const store of stores) {
        await supabase.from('stores').update({ allowed_dashboard: value }).eq('id', store.id);
      }
      toast.success(type === 'all' ? 'Global provisioning successful' : 'Global revocation successful');
      fetchStores();
    } catch (err) {
      toast.error('Global operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const removeSingle = async (storeId, dashboard) => {
    setIsLoading(true);
    const store = stores.find(s => s.id === storeId);
    const updated = store.allowed_dashboard.split(',').filter(d => d && d !== dashboard).join(',');

    const { error } = await supabase.from('stores').update({ allowed_dashboard: updated }).eq('id', storeId);
    if (!error) {
      toast.success(`Revoked ${dashboard} access`);
      fetchStores();
    } else {
      toast.error('Partial revocation failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="bottom-right" theme="dark" />

      {/* Control Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Search & Bulk Select */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Registry Synchronization</h3>
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 rounded-lg border border-slate-100 dark:border-slate-700 transition-all active:scale-95"
              >
                {selectedStores.length === filtered.length ? <CheckSquare size={12} /> : <Square size={12} />}
                {selectedStores.length === filtered.length ? 'Deselect Registry' : 'Select All Registered'}
              </button>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Synchronize with store ID or entity name..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl text-sm transition-all outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Module Selector */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Capability Provisioning</h3>
            <div className="flex flex-wrap gap-2">
              {dashboardOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleDashboardToggle(opt.value)}
                  className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${selectedDashboards.includes(opt.value)
                    ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-600/20 active:scale-95'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <Zap size={12} fill={selectedDashboards.includes(opt.value) ? "currentColor" : "none"} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-wrap gap-3">
          <button
            onClick={() => updateAccess('assign')}
            disabled={isLoading}
            className="flex-1 min-w-[180px] py-4 bg-indigo-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/10 hover:bg-indigo-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            <Lock size={16} /> Provision Selected
          </button>
          <button
            onClick={() => updateAccess('revoke')}
            disabled={isLoading}
            className="flex-1 min-w-[180px] py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            <Unlock size={16} /> Revoke Access
          </button>

          <div className="w-full md:w-auto flex gap-2">
            <button
              onClick={() => massOperation('all')}
              className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800/50 rounded-xl hover:bg-emerald-100 transition-all active:scale-95"
              title="Global Assignment"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => massOperation('none')}
              className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-100 dark:border-red-800/50 rounded-xl hover:bg-red-100 transition-all active:scale-95"
              title="Global Reset"
            >
              <X size={20} />
            </button>
            <button
              onClick={fetchStores}
              className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all active:scale-95"
              title="Refresh Registry"
            >
              <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Registry List */}
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {String(store.id).slice(0, 8)}</p>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400/70 uppercase tracking-widest">
                      {store.allowed_dashboard?.split(',').filter(Boolean).length || 0} Modules Active
                    </p>
                  </div>
                </div>
              </div>

              {/* Tag Selection / Current Modules */}
              <div className="flex-1 flex flex-wrap gap-1.5">
                {store.allowed_dashboard?.split(',').filter(Boolean).map((d) => {
                  const opt = dashboardOptions.find(o => o.value === d);
                  return (
                    <div key={d} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-indigo-900 dark:text-indigo-200 rounded-lg group/tag hover:bg-slate-200 transition-all">
                      <span>{opt?.label || d}</span>
                      <button
                        onClick={() => removeSingle(store.id, d)}
                        className="p-1 hover:bg-red-500 hover:text-white rounded-md transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  );
                })}
                {(!store.allowed_dashboard || store.allowed_dashboard.length === 0) && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-300 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                    <Lock size={10} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Locked Entity</span>
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
            <Shield size={32} />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">No Matching Protocols</h3>
          <p className="text-slate-400 font-bold uppercase tracking-[0.1em] text-[10px]">Registry synchronization returned zero results</p>
        </div>
      )}
    </div>
  );
};

export default StoreAccess;
