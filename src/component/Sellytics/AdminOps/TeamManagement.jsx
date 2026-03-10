import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { toast } from 'react-toastify';
import {
    UserPlus, Users, EyeOff, Trash2, Edit3,
    Search, AlertTriangle, X, Eye
} from 'lucide-react';
import { FaStore } from 'react-icons/fa';
import { PLANS, getUserLimit, getEffectivePlan } from '../../../utils/planManager';
import UpgradePlanModal from '../Shared/UpgradePlanModal';

const ROLES = [
    { value: 'manager', label: 'Manager', desc: 'Full store access', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    { value: 'cashier', label: 'Cashier', desc: 'Sales & POS only', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'accountant', label: 'Accountant', desc: 'Financial management', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { value: 'inventory', label: 'Inventory Clerk', desc: 'Stock management', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    { value: 'staff', label: 'Staff', desc: 'Basic view access', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
];

export default function TeamManagement() {
    const ownerId = localStorage.getItem('owner_id');
    const currentStoreId = localStorage.getItem('store_id');

    const [stores, setStores] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isParentStore, setIsParentStore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStore, setFilterStore] = useState('all');
    const [currentPlan, setCurrentPlan] = useState(PLANS.FREE);
    const [subscription, setSubscription] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const [form, setForm] = useState({
        full_name: '',
        email_address: '',
        phone_number: '',
        role: 'staff',
        password: '',
        store_id: currentStoreId || '',
        owner_id: ownerId ? Number(ownerId) : null,
    });

    // ─── HELPERS ────────────────────────────
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

    // ─── FETCH DATA ────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let storeList = [];

            if (ownerId) {
                // 1. Fetch store's base data for legacy trial calculation
                const { data: storeData } = await supabase
                    .from('stores')
                    .select('plan, created_at')
                    .eq('id', currentStoreId)
                    .single();

                const { data: subResult } = await supabase
                    .rpc('get_owner_subscription', { p_owner_id: Number(ownerId) });

                const sub = subResult?.[0];
                setSubscription(sub || null);
                const parentStoreId = sub?.store_id;
                const isParent = parentStoreId === Number(currentStoreId);
                setIsParentStore(isParent);

                // 2. Determine effective plan using centralized logic
                const effective = getEffectivePlan(
                    storeData?.plan || PLANS.FREE,
                    sub || storeData?.created_at
                );
                
                setCurrentPlan(effective);

                if (isParent) {
                    // Parent: fetch ALL stores for this owner
                    const { data: allStores } = await supabase
                        .from('stores')
                        .select('id, shop_name')
                        .eq('owner_user_id', ownerId);
                    storeList = allStores || [];
                } else {
                    // Child store: only own store
                    const { data: ownStore } = await supabase
                        .from('stores')
                        .select('id, shop_name')
                        .eq('id', currentStoreId);
                    storeList = ownStore || [];
                }
            } else {
                // No owner — standalone store
                const { data: ownStore } = await supabase
                    .from('stores')
                    .select('id, shop_name')
                    .eq('id', currentStoreId);
                storeList = ownStore || [];
                setIsParentStore(false);
                setSubscription(null);
            }

            setStores(storeList);

            // Fetch team members for visible stores
            const storeIds = storeList.map(s => s.id);
            if (storeIds.length > 0) {
                const { data: users } = await supabase
                    .from('store_users')
                    .select('id, full_name, email_address, phone_number, role, store_id, created_at')
                    .in('store_id', storeIds)
                    .order('created_at', { ascending: false });
                setTeamMembers(users || []);
            } else {
                setTeamMembers([]);
            }
        } catch (err) {
            toast.error('Failed to load team data');
        } finally {
            setLoading(false);
        }
    }, [ownerId, currentStoreId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ─── COUNTS PER STORE ────────────────────
    const getUserCountForStore = (storeId) =>
        teamMembers.filter(m => m.store_id === Number(storeId)).length;

    const canAddToStore = (storeId) =>
        getUserCountForStore(storeId) < getUserLimit(currentPlan, subscription);

    // ─── MODAL ────────────────────────────────
    const openModal = (mode, user = null) => {
        setModalMode(mode);
        setSelectedUser(user);
        setShowPassword(false);
        if (mode === 'edit' && user) {
            setForm({
                full_name: user.full_name || '',
                email_address: user.email_address || '',
                phone_number: user.phone_number || '',
                role: user.role || 'staff',
                password: '',
                store_id: user.store_id || currentStoreId || '',
                owner_id: ownerId ? Number(ownerId) : null,
            });
        } else {
            setForm({
                full_name: '',
                email_address: '',
                phone_number: '',
                role: 'staff',
                password: '',
                store_id: isParentStore ? '' : (currentStoreId || ''),
                owner_id: ownerId ? Number(ownerId) : null,
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.store_id) {
            toast.error('Please select a store');
            return;
        }
        if (!canAddToStore(form.store_id) && modalMode === 'add') {
            setIsModalOpen(false);
            setShowUpgradeModal(true);
            return;
        }
        if (modalMode === 'add' && (!form.password || form.password.length < 6)) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setSubmitting(true);
        try {
            const payload = { ...form };

            if (modalMode === 'add') {
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
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this team member? This cannot be undone.')) return;
        try {
            const { error } = await supabase.from('store_users').delete().eq('id', id);
            if (error) throw error;
            toast.success('Team member removed');
            fetchData();
        } catch (err) {
            toast.error(err.message);
        }
    };

    // ─── FILTERING ──────────────────────────
    const filtered = teamMembers.filter(m => {
        const matchesSearch =
            m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email_address?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStore = filterStore === 'all' || m.store_id === Number(filterStore);
        return matchesSearch && matchesStore;
    });

    const getStoreName = (storeId) =>
        stores.find(s => s.id === storeId)?.shop_name || `Store #${storeId}`;

    const getRoleStyle = (role) =>
        ROLES.find(r => r.value === role)?.color || 'bg-slate-100 text-slate-700';

    // ─── LOADING ──────────────────────────
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ─── HEADER ──────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Team Management
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''} across {stores.length} store{stores.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <button
                    onClick={() => openModal('add')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 font-bold text-sm"
                >
                    <UserPlus className="w-4 h-4" /> Add Team Member
                </button>
            </div>

            {/* ─── STORE SLOTS OVERVIEW ──── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stores.map(store => {
                    const count = getUserCountForStore(store.id);
                    const userLimit = getUserLimit(currentPlan, subscription);
                    const isInfiniteUsers = userLimit === Infinity;
                    const isFull = !isInfiniteUsers && count >= userLimit;

                    return (
                        <div key={store.id} className={`p-4 rounded-xl border ${isFull ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <FaStore className={`${isFull ? 'text-red-500' : 'text-indigo-500'}`} />
                                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{store.shop_name}</span>
                                </div>
                                <span className={`text-xs font-bold ${isFull ? 'text-red-500' : 'text-slate-400'}`}>
                                    {count}/{isInfiniteUsers ? '∞' : userLimit}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${isInfiniteUsers ? 'bg-emerald-500' : isFull ? 'bg-red-500' : count >= userLimit - 2 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${isInfiniteUsers ? 100 : Math.min((count / userLimit) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ─── SEARCH & FILTER ──────── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search team members..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    />
                </div>
                {stores.length > 1 && (
                    <select
                        value={filterStore}
                        onChange={e => setFilterStore(e.target.value)}
                        className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                    >
                        <option value="all">All Stores</option>
                        {stores.map(s => (
                            <option key={s.id} value={s.id}>{s.shop_name}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* ─── TEAM LIST ──────────── */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No team members yet</h3>
                    <p className="text-slate-500 text-sm mt-1">Add your first team member to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filtered.map(member => (
                        <div key={member.id} className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                                        {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{member.full_name}</h4>
                                        <p className="text-xs text-slate-500">{member.email_address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openModal('edit', member)}
                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member.id)}
                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getRoleStyle(member.role)}`}>
                                    {member.role}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                    <FaStore className="text-[8px]" /> {getStoreName(member.store_id)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── ADD/EDIT MODAL ──────── */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {modalMode === 'add' ? 'Add Team Member' : 'Edit Team Member'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    {modalMode === 'add' ? 'Create a new team member account' : 'Update member details'}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={form.full_name}
                                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                    placeholder="John Doe"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email_address}
                                    onChange={e => setForm({ ...form, email_address: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                    placeholder="john@example.com"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={form.phone_number}
                                    onChange={e => setForm({ ...form, phone_number: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                    placeholder="+233 XX XXX XXXX"
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ROLES.map(r => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setForm({ ...form, role: r.value })}
                                            className={`p-2.5 rounded-xl border-2 text-left transition-all ${form.role === r.value
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                                }`}
                                        >
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">{r.label}</span>
                                            <p className="text-[10px] text-slate-500">{r.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Assign to Store */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Assign to Store
                                    {!isParentStore && <span className="text-xs text-slate-400 font-normal ml-1">(your store only)</span>}
                                </label>
                                {isParentStore && stores.length > 1 ? (
                                    <select
                                        required
                                        value={form.store_id}
                                        onChange={e => setForm({ ...form, store_id: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                    >
                                        <option value="">Select a store...</option>
                                        {stores.map(s => {
                                            const count = getUserCountForStore(s.id);
                                            const full = count >= getUserLimit(currentPlan, subscription);
                                            return (
                                                <option key={s.id} value={s.id} disabled={full}>
                                                    {s.shop_name} ({count}/{getUserLimit(currentPlan, subscription)}){full ? ' — FULL' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                ) : (
                                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <FaStore className="text-indigo-500 text-xs" />
                                        {stores.find(s => s.id === Number(form.store_id))?.shop_name || 'Your Store'}
                                        <span className="ml-auto text-xs text-slate-400">
                                            {getUserCountForStore(form.store_id)}/{getUserLimit(currentPlan, subscription)}
                                        </span>
                                    </div>
                                )}

                                {/* Limit warning */}
                                {form.store_id && !canAddToStore(form.store_id) && modalMode === 'add' && (
                                    <div className="mt-2 flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900">
                                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                                            This store has reached the {getUserLimit(currentPlan, subscription)}-member limit.
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Password {modalMode === 'edit' && <span className="text-xs text-slate-400 font-normal">(leave blank to keep current)</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        required={modalMode === 'add'}
                                        minLength={6}
                                        className="w-full px-4 py-2.5 pr-10 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                        placeholder={modalMode === 'add' ? 'Min 6 characters' : 'Leave blank to keep current'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || (modalMode === 'add' && form.store_id && !canAddToStore(form.store_id))}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {modalMode === 'add' ? <UserPlus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                                            {modalMode === 'add' ? 'Create Member' : 'Save Changes'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── UPGRADE MODAL ──── */}
            <UpgradePlanModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                currentPlan={currentPlan}
                reason="team_limit"
            />
        </div>
    );
}
