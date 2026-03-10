import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Plus,
  Trash2,
  Edit3,
  Shield,
  Users,
  Store,
  Package,
  Zap,
  X,
  Check,
  AlertCircle,
  Layout,
  Database,
  Cpu,
  BarChart3,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SubscriptionPlansCRUD = () => {
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: '',
    price: '',
    description: '',
    max_users_per_store: 1,
    max_stores: 1,
    max_products: 50,
    has_warehouse: false,
    has_admin_ops: false,
    has_ai_insights: false,
    has_financial_dashboard: false,
    has_multi_store: false
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('subscription_plans').select('*');
    if (error) {
      showNotification('Registry sync failed', 'error');
    } else {
      setPlans(data);
    }
    setIsLoading(false);
  }, [showNotification]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Protocol name required';
    if (form.price === '' || parseFloat(form.price) < 0) newErrors.price = 'Invalid valuation';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    const payload = {
      name: form.name.toUpperCase(),
      price: parseFloat(form.price),
      description: form.description,
      max_users_per_store: parseInt(form.max_users_per_store),
      max_stores: parseInt(form.max_stores),
      max_products: parseInt(form.max_products),
      has_warehouse: form.has_warehouse,
      has_admin_ops: form.has_admin_ops,
      has_ai_insights: form.has_ai_insights,
      has_financial_dashboard: form.has_financial_dashboard,
      has_multi_store: form.has_multi_store
    };

    try {
      if (form.id) {
        const { error } = await supabase.from('subscription_plans').update(payload).eq('id', form.id);
        if (error) throw error;
        showNotification('Plan architecture updated', 'success');
      } else {
        const { error } = await supabase.from('subscription_plans').insert([payload]);
        if (error) throw error;
        showNotification('New plan provisioned', 'success');
      }
      fetchPlans();
      closeModal();
    } catch (error) {
      showNotification('Strategic update failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (plan = null) => {
    if (plan) {
      setForm({
        id: plan.id,
        name: plan.name,
        price: plan.price.toString(),
        description: plan.description || '',
        max_users_per_store: plan.max_users_per_store || 1,
        max_stores: plan.max_stores || 1,
        max_products: plan.max_products || 50,
        has_warehouse: plan.has_warehouse || false,
        has_admin_ops: plan.has_admin_ops || false,
        has_ai_insights: plan.has_ai_insights || false,
        has_financial_dashboard: plan.has_financial_dashboard || false,
        has_multi_store: plan.has_multi_store || false
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirm protocol deletion?')) return;
    const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
    if (error) showNotification('De-provisioning failed', 'error');
    else {
      showNotification('Plan removed from registry', 'success');
      fetchPlans();
    }
  };

  const resetForm = () => {
    setForm({
      id: null, name: '', price: '', description: '',
      max_users_per_store: 1, max_stores: 1, max_products: 50,
      has_warehouse: false, has_admin_ops: false, has_ai_insights: false,
      has_financial_dashboard: false, has_multi_store: false
    });
    setErrors({});
  };

  return (
    <div className="space-y-8 pb-20 overflow-x-hidden">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`fixed top-24 right-4 lg:right-10 px-6 py-4 rounded-2xl text-white z-[70] shadow-2xl flex items-center gap-3 font-bold text-sm backdrop-blur-md ${notification.type === 'success' ? 'bg-emerald-500/90' : 'bg-red-500/90'
              }`}
          >
            {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registry Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="text-left w-full sm:w-auto">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Infrastructure Registry</h3>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Operational Tier Management</p>
        </div>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={18} /> Provision New Plan
        </button>
      </div>

      {/* Registry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.sort((a, b) => a.price - b.price).map((plan) => (
          <motion.div
            layout
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm group hover:border-indigo-200 dark:hover:border-indigo-900 transition-all flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <h4 className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase">{plan.name}</h4>
                  <p className="text-2xl font-black text-indigo-600 mt-1 tabular-nums">${plan.price.toFixed(2)}<span className="text-[10px] text-gray-400 font-bold ml-1 uppercase tracking-widest">/ Term</span></p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(plan)} className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-110 active:scale-90"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(plan.id)} className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-600 rounded-xl transition-all shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-110 active:scale-90"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Users, label: 'Nodes', value: plan.max_users_per_store },
                  { icon: Store, label: 'Stores', value: plan.max_stores },
                  { icon: Package, label: 'Units', value: plan.max_products === -1 ? '∞' : plan.max_products },
                ].map((idx, i) => (
                  <div key={i} className="bg-gray-50/50 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-50 dark:border-gray-800 text-left">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                      <idx.icon size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest leading-none">{idx.label}</span>
                    </div>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{idx.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 text-left">
                {plan.has_warehouse && <span className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-tight flex items-center gap-1.5"><Database size={12} /> Warehouse</span>}
                {plan.has_admin_ops && <span className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-tight flex items-center gap-1.5"><Shield size={12} /> Admin Ops</span>}
                {plan.has_ai_insights && <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-tight flex items-center gap-1.5"><Cpu size={12} /> AI Node</span>}
                {plan.has_financial_dashboard && <span className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-tight flex items-center gap-1.5"><BarChart3 size={12} /> Finance</span>}
                {plan.has_multi_store && <span className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-tight flex items-center gap-1.5"><Layout size={12} /> Multi-Store</span>}
                {!(plan.has_warehouse || plan.has_admin_ops || plan.has_ai_insights || plan.has_financial_dashboard || plan.has_multi_store) && (
                  <span className="text-[10px] font-bold text-gray-300 italic tracking-widest uppercase py-1.5">No Enhanced Capabilities</span>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800 text-left">
              <p className="text-[11px] text-gray-400 font-medium line-clamp-2 leading-relaxed">
                {plan.description || "Core infrastructure protocol without additional overrides."}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Section */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <button onClick={closeModal} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X size={24} /></button>

              <div className="text-left">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 flex items-center justify-center">
                    <Settings2 size={20} />
                  </div>
                  {form.id ? 'Architecture Update' : 'Provision Plan'}
                </h2>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">System Configuration Terminal</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Protocol Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. ENTERPRISE"
                    className={`w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-2xl outline-none transition-all font-bold text-sm dark:text-white ${errors.name ? 'border-red-500' : 'border-transparent focus:border-indigo-500/20'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Valuation ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl outline-none font-bold text-sm dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Max Node Users</label>
                    <input
                      type="number"
                      name="max_users_per_store"
                      value={form.max_users_per_store}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl outline-none font-bold text-sm dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Entity Limit</label>
                    <input
                      type="number"
                      name="max_stores"
                      value={form.max_stores}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl outline-none font-bold text-sm dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Product Cap</label>
                    <input
                      type="number"
                      name="max_products"
                      value={form.max_products}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl outline-none font-bold text-sm dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Protocol Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Define protocol scope..."
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl outline-none font-bold text-sm dark:text-white h-24 resize-none"
                  />
                </div>

                <div className="pt-4 space-y-3">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1 mb-2 block">System Capabilities</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { name: 'has_warehouse', label: 'Warehouse Architecture', icon: Database },
                      { name: 'has_admin_ops', label: 'Admin Ops Interface', icon: Shield },
                      { name: 'has_ai_insights', label: 'AI Intelligence Node', icon: Cpu },
                      { name: 'has_financial_dashboard', label: 'Financial Core', icon: BarChart3 },
                      { name: 'has_multi_store', label: 'Multi-Store Database', icon: Layout },
                    ].map(feat => (
                      <button
                        key={feat.name}
                        onClick={() => handleChange({ target: { name: feat.name, type: 'checkbox', checked: !form[feat.name] } })}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${form[feat.name]
                          ? 'bg-indigo-50/50 border-indigo-500/20 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                          : 'bg-transparent border-gray-50 dark:border-gray-800 text-gray-400'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <feat.icon size={16} />
                          <span className="text-xs font-bold">{feat.label}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${form[feat.name]
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-transparent border-gray-200 dark:border-gray-700'
                          }`}>
                          {form[feat.name] && <Check size={12} strokeWidth={4} />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full py-5 bg-indigo-900 dark:bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {form.id ? 'Authorize Updates' : 'Provision Plan'}
                  </button>
                  <button
                    onClick={closeModal}
                    className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm"
                  >
                    Abort Protocol
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {plans.length === 0 && !isLoading && (
        <div className="p-20 text-center bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
          <Zap size={40} className="mx-auto text-gray-200 mb-6" />
          <p className="text-gray-400 text-sm font-black uppercase tracking-widest">Protocol Registry Empty</p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlansCRUD;
