import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Search,
  Download,
  Edit2,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Users,
  Store,
  Mail,
  Phone,

  Filter,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (!search) setFiltered(stores);
    else {
      const q = search.toLowerCase();
      setFiltered(
        stores.filter(s =>
          s.shop_name?.toLowerCase().includes(q) ||
          s.full_name?.toLowerCase().includes(q) ||
          s.email_address?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, stores]);

  async function fetchStores() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setStores(data);
      setFiltered(data);
    }
    setIsLoading(false);
  }

  const toggleStatus = async (s) => {

    await supabase.from('stores').update({ is_active: !s.is_active }).eq('id', s.id);
    fetchStores();
  };

  const deleteStore = async (s) => {
    if (!window.confirm(`Permanently delete "${s.shop_name}"?`)) return;
    await supabase.from('stores').delete().eq('id', s.id);
    fetchStores();
  };

  const startEdit = (s) => {
    setEditing(s);
    setForm({
      shop_name: s.shop_name,
      full_name: s.full_name,
      email_address: s.email_address,
      phone_number: s.phone_number
    });
  };

  const saveEdit = async () => {
    await supabase.from('stores').update(form).eq('id', editing.id);
    setEditing(null);
    fetchStores();
  };

  const exportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,Shop Name,Owner,Email,Status,Date\n";
    filtered.forEach(s => {
      csv += `${s.shop_name},${s.full_name},${s.email_address},${s.is_active ? 'Active' : 'Suspended'},${s.created_at}\n`;
    });
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = 'enterprise_stores.csv';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Filter stores by name, owner, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all border border-gray-100 dark:border-gray-700">
            <Filter size={16} /> Filter
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Download size={16} /> Export Data
          </button>
        </div>
      </div>

      {/* Stores Table Card */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Store Entity</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Primary Contact</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Operational Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Onboarding Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              <AnimatePresence>
                {filtered.map((s, idx) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110 ${s.is_active ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                          }`}>
                          <Store size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white capitalize">{s.shop_name}</p>
                          <p className="text-[11px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">Store ID: #{String(s.id).slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{s.full_name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                          <Mail size={12} /> {s.email_address}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${s.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider uppercase ${s.is_active
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                          }`}>
                          {s.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 tabular-nums">
                      {new Date(s.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(s)}
                          className="p-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 shadow-sm transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => toggleStatus(s)}
                          className={`p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:scale-105 ${s.is_active
                            ? 'text-amber-600 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-900/30'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-500 dark:hover:bg-emerald-900/30'
                            }`}
                        >
                          {s.is_active ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                        </button>
                        <button
                          onClick={() => deleteStore(s)}
                          className="p-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && !isLoading && (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <Store size={32} />
              </div>
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No stores matching your query</p>
            </div>
          )}
        </div>
      </div>

      {/* Enterprise Edit Modal */}
      <AnimatePresence>
        {editing && (
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto no-scrollbar pt-10 sm:pt-20"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col relative mb-20"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 rounded-t-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Modify Store Entity</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Reference ID: {String(editing.id).slice(0, 12)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(null)}
                  className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { id: 'shop_name', label: 'Store Entity Name', icon: Store, placeholder: 'e.g. Lagos Hub' },
                    { id: 'full_name', label: 'Registered Owner', icon: Users, placeholder: 'e.g. John Doe' },
                    { id: 'email_address', label: 'Corporate Email', icon: Mail, placeholder: 'owner@example.com' },
                    { id: 'phone_number', label: 'Primary Phone', icon: Phone, placeholder: '+234...' },
                  ].map(field => (
                    <div key={field.id} className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block ml-1">{field.label}</label>
                      <div className="relative group">
                        <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input
                          type="text"
                          value={form[field.id]}
                          placeholder={field.placeholder}
                          onChange={e => setForm({ ...form, [field.id]: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-xl text-sm font-bold transition-all outline-none dark:text-white placeholder:text-gray-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      <Check size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-indigo-900 dark:text-indigo-200">System Permission Granted</p>
                      <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400/70 uppercase tracking-wider">Infrastructure modification level: high</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 sm:p-8 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 rounded-b-2xl">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all text-center"
                >
                  Discard Changes
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 px-8 py-4 bg-indigo-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-800 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Update Store Status
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
