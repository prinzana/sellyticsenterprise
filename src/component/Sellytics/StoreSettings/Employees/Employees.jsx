import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import { toast } from 'react-toastify';
import {
  UserPlus, Users, Eye, EyeOff, AlertTriangle, X, Crown
} from 'lucide-react';

import { useNotification } from './useNotification';
import { useInviteLink } from './useInviteLink';
import TeamMemberCard from './TeamMemberCard';
import InviteCard from './InviteCard';
import NotificationBanner from './NotificationBanner';
import { PLANS, getUserLimit, getEffectivePlan } from '../../../../utils/planManager';
import UpgradePlanModal from '../../Shared/UpgradePlanModal';

const ROLES = [
  { value: 'manager', label: 'Manager', desc: 'Full store access' },
  { value: 'cashier', label: 'Cashier', desc: 'Sales & POS only' },
  { value: 'accountant', label: 'Accountant', desc: 'Financial management' },
  { value: 'inventory', label: 'Inventory Clerk', desc: 'Stock management' },
  { value: 'staff', label: 'Staff', desc: 'Basic view access' },
];

export default function TeamManagementPage() {
  const { notification, notify } = useNotification();
  const { inviteLink, generateInvite } = useInviteLink(notify);

  const storeId = localStorage.getItem('store_id');
  const ownerId = localStorage.getItem('owner_id');

  const [members, setMembers] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(PLANS.FREE);
  const [subscription, setSubscription] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email_address: '',
    phone_number: '',
    role: 'staff',
    password: '',
    store_id: storeId,
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

  // ─── FETCH ────────────────────────────
  const fetchData = useCallback(async () => {
    // Fetch members
    const { data, error } = await supabase
      .from('store_users')
      .select('*')
      .eq('store_id', storeId);

    if (error) notify('Failed to load team members', 'error');
    else setMembers(data || []);

    // Fetch plan via owner subscription
    const effectiveOwnerId = ownerId;
    let sub = null;
    let storeBasePlan = PLANS.FREE;
    let storeCreatedAt = null;

    // 1. Fetch store's base data for legacy trial calculation
    const { data: storeData } = await supabase
      .from('stores')
      .select('plan, created_at, owner_user_id')
      .eq('id', storeId)
      .maybeSingle();

    if (storeData) {
      storeBasePlan = storeData.plan || PLANS.FREE;
      storeCreatedAt = storeData.created_at;
    }

    const targetOwnerId = effectiveOwnerId || storeData?.owner_user_id;

    if (targetOwnerId) {
      const { data: subResult } = await supabase
        .rpc('get_owner_subscription', { p_owner_id: Number(targetOwnerId) });
      sub = subResult?.[0];
    }

    setSubscription(sub || null);
    
    // 2. Determine effective plan using centralized logic
    const effective = getEffectivePlan(
      storeBasePlan,
      sub || storeCreatedAt
    );
    
    setCurrentPlan(effective);
  }, [storeId, ownerId, notify]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── LIMITS ────────────────────────────
  const maxUsers = getUserLimit(currentPlan, subscription);
  const isInfiniteUsers = maxUsers === Infinity;
  const memberCount = members.length;
  const isFull = !isInfiniteUsers && memberCount >= maxUsers;

  // ─── REMOVE / SUSPEND ────────────────
  const removeMember = async (id) => {
    await supabase.from('store_users').delete().eq('id', id);
    notify('Member removed');
    fetchData();
  };

  const suspendMember = async (id, suspended) => {
    await supabase
      .from('store_users')
      .update({ role: suspended ? 'attendant' : 'suspended' })
      .eq('id', id);
    notify(suspended ? 'Member activated' : 'Member suspended');
    fetchData();
  };

  // ─── ADD MEMBER ────────────────────────
  const openAddModal = () => {
    if (isFull) {
      setShowUpgradeModal(true);
      return;
    }
    setForm({
      full_name: '',
      email_address: '',
      phone_number: '',
      role: 'staff',
      password: '',
      store_id: storeId,
      owner_id: ownerId ? Number(ownerId) : null,
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFull) {
      setIsModalOpen(false);
      setShowUpgradeModal(true);
      return;
    }
    if (!form.password || form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, password: await hashPassword(form.password) };
      const { error } = await supabase.from('store_users').insert([payload]);
      if (error) throw error;
      toast.success('Team member added successfully');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <NotificationBanner notification={notification} />

      {/* ─── LIMIT BANNER ──────────── */}
      <div className={`p-4 rounded-xl border ${isFull ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${isFull ? 'text-red-500' : 'text-indigo-500'}`} />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Team Members</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${currentPlan === PLANS.BUSINESS ? 'bg-purple-100 text-purple-700' :
              currentPlan === PLANS.PREMIUM ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>
              {currentPlan}
            </span>
          </div>
          <span className={`text-sm font-bold ${isFull ? 'text-red-500' : 'text-slate-500'}`}>
            {memberCount} / {isInfiniteUsers ? '∞' : maxUsers}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isInfiniteUsers ? 'bg-emerald-500' : isFull ? 'bg-red-500' : memberCount >= maxUsers - 1 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${isInfiniteUsers ? 100 : Math.min((memberCount / maxUsers) * 100, 100)}%` }}
          />
        </div>
        {isFull && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                Limit reached.
              </span>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Crown className="w-3 h-3" /> Upgrade Plan
            </button>
          </div>
        )}
      </div>

      {/* ─── ACTION ROW ────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg hover:shadow-indigo-500/20 font-semibold text-sm active:scale-[0.98] whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          Add Team Member
        </button>
        <InviteCard inviteLink={inviteLink} onGenerate={generateInvite} />
      </div>

      {/* ─── TEAM LIST ──────────── */}
      {members.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No team members yet</h3>
          <p className="text-slate-500 text-sm mt-1">Add your first team member to get started</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {members.map((m, index) => (
            <TeamMemberCard
              key={m.id}
              index={index}
              member={m}
              onRemove={removeMember}
              onSuspend={suspendMember}
            />
          ))}
        </div>
      )}

      {/* ─── ADD MODAL ──────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Team Member</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {memberCount}/{maxUsers} slots used on {currentPlan} plan
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text" required
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
                  type="email" required
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

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required minLength={6}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-2.5 pr-10 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    placeholder="Min 6 characters"
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
                  disabled={submitting || isFull}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Create Member
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ─── UPGRADE MODAL ──────── */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
        reason="team_limit"
      />
    </div>
  );
}
