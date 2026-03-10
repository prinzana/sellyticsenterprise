import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStore, FaMapMarkerAlt, FaPhone, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { X, Store, MapPin, Phone, Mail, Globe, Save, Loader2, UserPlus, Users, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const ROLES = [
    { value: 'manager', label: 'Manager', desc: 'Full branch access' },
    { value: 'cashier', label: 'Cashier', desc: 'Sales & POS only' },
    { value: 'inventory', label: 'Inventory Clerk', desc: 'Stock management' },
    { value: 'staff', label: 'Staff', desc: 'Basic view access' },
];

const BranchManagement = () => {
    const [branches, setBranches] = useState([]);
    const [stores, setStores] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Branch Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedBranch, setSelectedBranch] = useState(null);

    // User Modal
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userModalMode, setUserModalMode] = useState('add');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Active tab: 'branches' or 'team'
    const [activeView, setActiveView] = useState('branches');

    const ownerId = Number(localStorage.getItem('owner_id'));

    const [formData, setFormData] = useState({
        branch_name: '',
        physical_address: '',
        phone_number: '',
        email_address: '',
        store_id: '',
    });

    const [userForm, setUserForm] = useState({
        full_name: '',
        email_address: '',
        phone_number: '',
        role: 'staff',
        password: '',
        store_id: '',
        branch_id: '',
        owner_id: ownerId,
    });

    // ─── HELPERS ──────────────────────
    const arrayBufferToHex = (buffer) =>
        Array.prototype.map
            .call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2))
            .join('');

    const hashPassword = async (plainText) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(plainText);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return arrayBufferToHex(hashBuffer);
    };

    // ─── FETCH DATA ──────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: storeData, error: storeError } = await supabase
                .from('stores')
                .select('id, shop_name')
                .eq('owner_user_id', ownerId);

            if (storeError) throw storeError;
            setStores(storeData || []);

            if (storeData && storeData.length > 0) {
                const storeIds = storeData.map(s => s.id);

                const [branchRes, userRes] = await Promise.all([
                    supabase
                        .from('branches')
                        .select('*')
                        .in('store_id', storeIds)
                        .order('created_at', { ascending: false }),
                    supabase
                        .from('store_users')
                        .select('id, full_name, email_address, phone_number, role, store_id, branch_id')
                        .in('store_id', storeIds)
                        .order('id', { ascending: false }),
                ]);

                if (branchRes.error) throw branchRes.error;
                if (userRes.error) throw userRes.error;

                setBranches(branchRes.data || []);
                setTeamMembers(userRes.data || []);
            }
        } catch (err) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [ownerId]);

    useEffect(() => {
        if (ownerId) fetchData();
    }, [fetchData, ownerId]);

    // ─── BRANCH CRUD ─────────────────
    const handleOpenModal = (mode, branch = null) => {
        setModalMode(mode);
        if (mode === 'edit' && branch) {
            setSelectedBranch(branch);
            setFormData({
                branch_name: branch.branch_name,
                physical_address: branch.physical_address || '',
                phone_number: branch.phone_number || '',
                email_address: branch.email_address || '',
                store_id: branch.store_id,
            });
        } else {
            setFormData({
                branch_name: '',
                physical_address: '',
                phone_number: '',
                email_address: '',
                store_id: stores.length === 1 ? stores[0].id : '',
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.store_id) {
            toast.error('Please select an organization');
            return;
        }
        setSubmitting(true);
        try {
            if (modalMode === 'add') {
                const { error } = await supabase.from('branches').insert([formData]);
                if (error) throw error;
                toast.success('Branch created successfully');
            } else {
                const { error } = await supabase.from('branches').update(formData).eq('id', selectedBranch.id);
                if (error) throw error;
                toast.success('Branch updated successfully');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this branch?')) return;
        try {
            const { error } = await supabase.from('branches').delete().eq('id', id);
            if (error) throw error;
            toast.success('Branch deleted');
            fetchData();
        } catch (err) {
            toast.error(err.message);
        }
    };

    // ─── USER CRUD ───────────────────
    const handleOpenUserModal = (mode, user = null) => {
        setUserModalMode(mode);
        setShowPassword(false);
        if (mode === 'edit' && user) {
            setSelectedUser(user);
            setUserForm({
                full_name: user.full_name || '',
                email_address: user.email_address || '',
                phone_number: user.phone_number || '',
                role: user.role || 'staff',
                password: '',
                store_id: user.store_id || '',
                branch_id: user.branch_id || '',
                owner_id: ownerId,
            });
        } else {
            setUserForm({
                full_name: '',
                email_address: '',
                phone_number: '',
                role: 'staff',
                password: '',
                store_id: stores.length === 1 ? stores[0].id : '',
                branch_id: '',
                owner_id: ownerId,
            });
        }
        setIsUserModalOpen(true);
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        if (!userForm.store_id) {
            toast.error('Please assign a store');
            return;
        }
        if (userModalMode === 'add' && (!userForm.password || userForm.password.length < 6)) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setSubmitting(true);
        try {
            const payload = { ...userForm };
            if (!payload.branch_id) delete payload.branch_id;

            if (userModalMode === 'add') {
                payload.password = await hashPassword(payload.password);
                const { error } = await supabase.from('store_users').insert([payload]);
                if (error) throw error;
                toast.success('Team member created successfully');
            } else {
                const { password, ...updatePayload } = payload;
                if (password && password.trim() !== '') {
                    updatePayload.password = await hashPassword(password);
                }
                const { error } = await supabase.from('store_users').update(updatePayload).eq('id', selectedUser.id);
                if (error) throw error;
                toast.success('Team member updated successfully');
            }
            setIsUserModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Remove this team member? This action cannot be undone.')) return;
        try {
            const { error } = await supabase.from('store_users').delete().eq('id', id);
            if (error) throw error;
            toast.success('Team member removed');
            fetchData();
        } catch (err) {
            toast.error(err.message);
        }
    };

    // ─── LOOKUPS ─────────────────────
    const getStoreName = (id) => stores.find(s => s.id === id)?.shop_name || 'Unknown';
    const getBranchName = (id) => branches.find(b => b.id === id)?.branch_name || '—';
    const getMembersForBranch = (branchId) => teamMembers.filter(m => m.branch_id === branchId);

    // Filtered branches for user form
    const filteredBranches = branches.filter(b => b.store_id === userForm.store_id);

    const inputClass = "w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-all font-medium";

    return (
        <div className="space-y-6">
            {/* ─── HEADER ──────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Branch & Team Management</h2>
                    <p className="text-slate-500 text-sm">Enterprise Multi-Location & Staff Overview</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleOpenUserModal('add')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 font-bold text-sm"
                    >
                        <UserPlus size={16} /> Add Team Member
                    </button>
                    <button
                        onClick={() => handleOpenModal('add')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 font-bold text-sm"
                    >
                        <FaPlus size={12} /> Add Branch
                    </button>
                </div>
            </div>

            {/* ─── VIEW TABS ───────────────── */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveView('branches')}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'branches' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <FaStore className="inline mr-2" /> Branches ({branches.length})
                </button>
                <button
                    onClick={() => setActiveView('team')}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'team' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Users className="inline mr-2" size={14} /> Team ({teamMembers.length})
                </button>
            </div>

            {/* ─── BRANCHES VIEW ───────────── */}
            {activeView === 'branches' && (
                <>
                    {loading && branches.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : branches.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaStore className="text-4xl text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Branches Yet</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-2">Create physical locations to organize your business.</p>
                            <button onClick={() => handleOpenModal('add')}
                                className="mt-6 px-6 py-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 rounded-xl font-bold hover:bg-indigo-200 transition-colors"
                            >
                                Create Your First Branch
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {branches.map(branch => {
                                const members = getMembersForBranch(branch.id);
                                return (
                                    <motion.div key={branch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">
                                                        {getStoreName(branch.store_id)}
                                                    </span>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{branch.branch_name}</h3>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleOpenModal('edit', branch)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><FaEdit size={14} /></button>
                                                    <button onClick={() => handleDelete(branch.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><FaTrash size={14} /></button>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                                <div className="flex items-start gap-2"><FaMapMarkerAlt className="mt-0.5 text-slate-400" size={12} /><span>{branch.physical_address || 'No address'}</span></div>
                                                <div className="flex items-center gap-2"><FaPhone className="text-slate-400" size={12} /><span>{branch.phone_number || 'No contact'}</span></div>
                                            </div>

                                            {/* Team Badge */}
                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                        <Users size={14} className="text-indigo-400" />
                                                        {members.length} Team Member{members.length !== 1 ? 's' : ''}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setUserForm(prev => ({ ...prev, store_id: branch.store_id, branch_id: branch.id }));
                                                            handleOpenUserModal('add');
                                                        }}
                                                        className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                                                    >
                                                        + Add
                                                    </button>
                                                </div>
                                                {members.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {members.slice(0, 3).map(m => (
                                                            <div key={m.id} className="flex items-center justify-between text-xs">
                                                                <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{m.full_name}</span>
                                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full capitalize">{m.role}</span>
                                                            </div>
                                                        ))}
                                                        {members.length > 3 && <p className="text-xs text-slate-400">+{members.length - 3} more</p>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* ─── TEAM VIEW ──────────────── */}
            {activeView === 'team' && (
                <>
                    {teamMembers.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="text-emerald-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Team Members</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-2">Add staff and assign them to branches.</p>
                            <button onClick={() => handleOpenUserModal('add')}
                                className="mt-6 px-6 py-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-xl font-bold hover:bg-emerald-200 transition-colors"
                            >
                                Add Your First Team Member
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-left">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Organization</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Branch</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teamMembers.map(member => (
                                            <tr key={member.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{member.full_name}</p>
                                                    <p className="text-xs text-slate-400">{member.phone_number || '—'}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{member.email_address}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold capitalize">{member.role}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{getStoreName(member.store_id)}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{getBranchName(member.branch_id)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-1">
                                                        <button onClick={() => handleOpenUserModal('edit', member)} className="p-2 text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 rounded-lg transition-all"><FaEdit size={14} /></button>
                                                        <button onClick={() => handleDeleteUser(member.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><FaTrash size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* BRANCH MODAL */}
            {/* ═══════════════════════════════════════════ */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <Store className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{modalMode === 'add' ? 'Add New Branch' : 'Edit Branch'}</h2>
                                        <p className="text-xs text-slate-500 font-medium">Enterprise Location Detail</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Organization <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select required value={formData.store_id} onChange={e => setFormData({ ...formData, store_id: Number(e.target.value) })} className={inputClass}>
                                                <option value="">Select Organization</option>
                                                {stores.map(s => <option key={s.id} value={s.id}>{s.shop_name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Branch Name <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input required type="text" value={formData.branch_name} onChange={e => setFormData({ ...formData, branch_name: e.target.value })} className={inputClass} placeholder="e.g. Lagos Mainland HQ" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Physical Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <textarea rows={2} value={formData.physical_address} onChange={e => setFormData({ ...formData, physical_address: e.target.value })} className={`${inputClass} resize-none`} placeholder="No 42, Business Street, Ikeja" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="tel" value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} className={inputClass} placeholder="+234..." />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="email" value={formData.email_address} onChange={e => setFormData({ ...formData, email_address: e.target.value })} className={inputClass} placeholder="branch@company.com" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-slate-600 dark:text-slate-400">Cancel</button>
                                    <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Save className="w-4 h-4" /> {modalMode === 'add' ? 'Create Location' : 'Update Location'}</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════ */}
            {/* USER / TEAM MEMBER MODAL */}
            {/* ═══════════════════════════════════════════ */}
            <AnimatePresence>
                {isUserModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsUserModalOpen(false)}
                    >
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <UserPlus className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{userModalMode === 'add' ? 'Add Team Member' : 'Edit Team Member'}</h2>
                                        <p className="text-xs text-slate-500 font-medium">Full staff details with branch assignment</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsUserModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleUserSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Name & Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input required type="text" value={userForm.full_name} onChange={e => setUserForm({ ...userForm, full_name: e.target.value })} className={inputClass} placeholder="John Doe" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input required type="email" value={userForm.email_address} onChange={e => setUserForm({ ...userForm, email_address: e.target.value })} className={inputClass} placeholder="staff@company.com" />
                                        </div>
                                    </div>
                                </div>

                                {/* Phone & Role */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="tel" value={userForm.phone_number} onChange={e => setUserForm({ ...userForm, phone_number: e.target.value })} className={inputClass} placeholder="+234..." />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Role <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} className={inputClass}>
                                                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Organization & Branch */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Assign Store <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select required value={userForm.store_id} onChange={e => setUserForm({ ...userForm, store_id: Number(e.target.value), branch_id: '' })} className={inputClass}>
                                                <option value="">Select Organization</option>
                                                {stores.map(s => <option key={s.id} value={s.id}>{s.shop_name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Assign Branch</label>
                                        <div className="relative">
                                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select value={userForm.branch_id} onChange={e => setUserForm({ ...userForm, branch_id: e.target.value ? Number(e.target.value) : '' })} className={inputClass}>
                                                <option value="">No specific branch</option>
                                                {filteredBranches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                            </select>
                                        </div>
                                        {userForm.store_id && filteredBranches.length === 0 && (
                                            <p className="text-xs text-amber-600 font-medium mt-1">No branches found for this store. Create one first.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        {userModalMode === 'add' ? 'Set Password' : 'Update Password'} {userModalMode === 'add' && <span className="text-rose-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={userForm.password}
                                            onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                            className={`${inputClass} pr-12`}
                                            placeholder={userModalMode === 'edit' ? 'Leave blank to keep current' : 'Minimum 6 characters'}
                                            required={userModalMode === 'add'}
                                            minLength={userModalMode === 'add' ? 6 : undefined}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {userModalMode === 'edit' && <p className="text-xs text-slate-400">Leave blank to keep the current password unchanged.</p>}
                                </div>

                                {/* Footer */}
                                <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                                    <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-slate-600 dark:text-slate-400">Cancel</button>
                                    <button type="submit" disabled={submitting} className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Save className="w-4 h-4" /> {userModalMode === 'add' ? 'Create Member' : 'Update Member'}</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BranchManagement;
