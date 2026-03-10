import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Search,
  Download,
  UserPen,

  UserCheck,

  Mail,
  Phone,
  User,
  Store,
  Trash2,
  Filter,

  History,
  UserX,
  X,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StoreUsers() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!search) setFiltered(users);
    else {
      const q = search.toLowerCase();
      setFiltered(
        users.filter(u =>
          u.full_name?.toLowerCase().includes(q) ||
          u.email_address?.toLowerCase().includes(q) ||
          u.role?.toLowerCase().includes(q) ||
          u.stores?.shop_name?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, users]);

  async function fetchUsers() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('store_users')
      .select('id, full_name, email_address, phone_number, role, created_at, stores(shop_name)')
      .order('created_at', { ascending: false });

    if (!error) {
      setUsers(data);
      setFiltered(data);
    }
    setIsLoading(false);
  }

  const toggleStatus = async (u) => {
    const isSuspended = u.role === 'suspended';
    const newRole = isSuspended ? 'attendant' : 'suspended';

    await supabase.from('store_users').update({ role: newRole }).eq('id', u.id);
    fetchUsers();
  };

  const deleteUser = async (u) => {
    if (!window.confirm(`Permanently remove access for "${u.full_name}"?`)) return;
    await supabase.from('store_users').delete().eq('id', u.id);
    fetchUsers();
  };

  const startEdit = (u) => {
    setEditing(u);
    setForm({
      full_name: u.full_name,
      email_address: u.email_address,
      phone_number: u.phone_number,
      role: u.role
    });
  };

  const saveEdit = async () => {
    await supabase.from('store_users').update(form).eq('id', editing.id);
    setEditing(null);
    fetchUsers();
  };

  const exportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,Name,Email,Role,Store,Registered\n";
    filtered.forEach(u => {
      csv += `${u.full_name},${u.email_address},${u.role},${u.stores?.shop_name},${u.created_at}\n`;
    });
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = 'enterprise_users.csv';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search personnel by name, email, or store..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700 shadow-sm">
            <Filter size={16} /> Advanced Filter
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Download size={16} /> Export Personnel Data
          </button>
        </div>
      </div>

      {/* Modern Data Grid */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Personnel Profile</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Enterprise Role</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Assigned Store</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Operational Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">Access Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            <AnimatePresence>
              {filtered.map((u, idx) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs shadow-sm shadow-indigo-100 dark:shadow-none transition-transform group-hover:scale-110">
                        {u.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-gray-900 dark:text-white line-clamp-1">{u.full_name}</p>
                        <div className="flex items-center gap-4">
                          <p className="text-[11px] text-gray-400 flex items-center gap-1 font-bold">
                            <Mail size={10} /> {u.email_address}
                          </p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1 font-bold">
                            <Phone size={10} /> {u.phone_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[11px] font-black text-gray-600 dark:text-gray-400 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl uppercase tracking-wider">
                      {u.role || 'Staff'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                      <Store size={14} className="text-gray-400" />
                      <span className="line-clamp-1">{u.stores?.shop_name || 'System Level'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${u.role === 'suspended' ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full tracking-wider uppercase shadow-sm ${u.role === 'suspended'
                        ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-100/50 dark:border-red-900/10'
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/10'
                        }`}>
                        {u.role === 'suspended' ? 'Access Voided' : 'Operational'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(u)}
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all hover:-translate-y-0.5"
                      >
                        <UserPen size={16} />
                      </button>
                      <button
                        onClick={() => toggleStatus(u)}
                        className={`p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:-translate-y-0.5 ${u.role === 'suspended'
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-500'
                          : 'text-amber-600 hover:bg-amber-50 dark:text-amber-500'
                          }`}
                      >
                        {u.role === 'suspended' ? <UserCheck size={16} /> : <UserX size={16} />}
                      </button>
                      <button
                        onClick={() => deleteUser(u)}
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 shadow-sm transition-all hover:-translate-y-0.5"
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
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-200">
              <User size={32} />
            </div>
            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Strategic Personnel Data Not Found</p>
          </div>
        )}
      </div>

      {/* Enterprise Personnel Modal */}
      <AnimatePresence>
        {editing && (
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl overflow-y-auto no-scrollbar pt-10 sm:pt-20"
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
                    <UserPen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Modify Personnel Access</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Personnel ID: {editing.id}</p>
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
                    { id: 'full_name', label: 'Legal Name', icon: User, placeholder: 'e.g. John Doe' },
                    { id: 'email_address', label: 'Company Email', icon: Mail, placeholder: 'personnel@example.com' },
                    { id: 'phone_number', label: 'Mobile Access', icon: Phone, placeholder: '+234...' },
                    { id: 'role', label: 'Security Level', icon: History, select: ['attendant', 'manager', 'owner', 'suspended'] },
                  ].map(field => (
                    <div key={field.id} className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block ml-1">{field.label}</label>
                      <div className="relative group">
                        <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        {field.select ? (
                          <select
                            value={form[field.id]}
                            onChange={e => setForm({ ...form, [field.id]: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-xl text-sm font-bold transition-all outline-none dark:text-white appearance-none cursor-pointer"
                          >
                            {field.select.map(opt => <option key={opt} value={opt} className="dark:bg-slate-900">{opt.toUpperCase()}</option>)}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={form[field.id]}
                            placeholder={field.placeholder}
                            onChange={e => setForm({ ...form, [field.id]: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-xl text-sm font-bold transition-all outline-none dark:text-white placeholder:text-gray-300"
                          />
                        )}
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
                      <p className="text-sm font-black text-indigo-900 dark:text-indigo-200">Security Credentials Validated</p>
                      <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400/70 uppercase tracking-wider">Access modification level: authorized</p>
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
                  Discard
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 px-8 py-4 bg-indigo-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-800 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Finalize Personnel Update
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
