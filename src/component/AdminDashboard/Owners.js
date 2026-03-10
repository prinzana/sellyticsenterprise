import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Users,
  Store,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  Trash2,
  Search,

  ArrowUpDown,
  UserPlus,
  RefreshCcw,

} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OwnersManagement() {
  const [owners, setOwners] = useState([]);
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const { data: ownerData } = await supabase.from('store_owners').select('id, full_name');
    const { data: storeData } = await supabase.from('stores').select('id, shop_name, owner_user_id, is_active');

    setOwners(ownerData || []);
    setStores(storeData || []);
    setFilteredStores(storeData || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredStores(
      stores.filter(s =>
        s.shop_name?.toLowerCase().includes(q) ||
        String(s.id).includes(q)
      )
    );
  }, [search, stores]);

  const updateAssignment = async (storeId, ownerId) => {
    await supabase.from('stores').update({ owner_user_id: ownerId || null }).eq('id', storeId);
    fetchData();
  };

  const toggleActive = async (store) => {
    await supabase.from('stores').update({ is_active: !store.is_active }).eq('id', store.id);
    fetchData();
  };

  const editStoreName = async (store) => {
    const newName = window.prompt('Modify Store Entity Name:', store.shop_name);
    if (newName) {
      await supabase.from('stores').update({ shop_name: newName.trim() }).eq('id', store.id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search stores or entities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-2xl hover:bg-gray-100 transition-all border border-gray-100 dark:border-gray-700">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all">
            <UserPlus size={16} /> New Entity
          </button>
        </div>
      </div>

      {/* Strategic List Container */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredStores.map((store, idx) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="group bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all flex flex-col lg:flex-row lg:items-center gap-4 relative overflow-hidden"
            >
              {/* Entity Info Section */}
              <div className="flex-1 flex items-center gap-3 sm:gap-4 min-w-[280px]">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${store.is_active ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40' : 'bg-gray-50 text-gray-400 dark:bg-gray-800'}`}>
                  <Store size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-black text-gray-900 dark:text-white capitalize truncate text-sm sm:text-base">{store.shop_name}</h3>
                    <div className={`flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${store.is_active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-50 text-red-600 dark:bg-red-500/10'}`}>
                      <div className={`w-1 h-1 rounded-full ${store.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      {store.is_active ? 'Live' : 'Standby'}
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">System Registry ID: #{String(store.id).slice(0, 12)}</p>
                </div>
              </div>

              {/* Ownership Control Section */}
              <div className="w-full lg:w-72 flex-shrink-0">
                <div className="relative group/select">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-focus-within/select:text-indigo-500 transition-colors" size={14} />
                  <select
                    value={store.owner_user_id || ''}
                    onChange={e => updateAssignment(store.id, Number(e.target.value))}
                    className="w-full pl-9 pr-8 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-[11px] font-black text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-indigo-500/10 outline-none appearance-none cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 uppercase"
                  >
                    <option value="">NO ASSIGNMENT</option>
                    {owners.map(o => (
                      <option key={o.id} value={o.id}>{o.full_name?.toUpperCase()}</option>
                    ))}
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={10} />
                </div>
              </div>

              {/* Command Actions Section */}
              <div className="flex items-center justify-between lg:justify-end gap-2 border-t lg:border-t-0 border-gray-50 dark:border-gray-800 pt-3 lg:pt-0">
                <div className="flex items-center gap-1.5 bg-gray-50/50 dark:bg-gray-800/30 p-1 rounded-xl">
                  <button
                    onClick={() => editStoreName(store)}
                    className="p-2 hover:bg-white dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 rounded-lg transition-all active:scale-90"
                    title="Rename Entity"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => toggleActive(store)}
                    className={`p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all active:scale-90 ${store.is_active ? 'text-gray-400 hover:text-amber-500' : 'text-gray-400 hover:text-emerald-500'}`}
                    title={store.is_active ? 'Set to Standby' : 'Set to Live'}
                  >
                    {store.is_active ? <ShieldAlert size={15} /> : <ShieldCheck size={15} />}
                  </button>
                </div>

                <button className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all active:scale-90">
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredStores.length === 0 && !loading && (
        <div className="p-20 text-center bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300 mb-4">
            <Users size={32} />
          </div>
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No matching entities found in the system</p>
        </div>
      )}
    </div>
  );
}
