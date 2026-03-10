import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const SubscriptionPlansCRUD = () => {
  // State for plans, form data, errors, and notifications
  const [plans, setPlans] = useState([]);
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

  // Define showNotification early to avoid no-use-before-define
  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, [setNotification]);

  // Memoize fetchPlans
  const fetchPlans = useCallback(async () => {
    const { data, error } = await supabase.from('subscription_plans').select('*');
    if (error) {
      showNotification('Error fetching plans', 'error');
      console.error('Fetch error:', error);
    } else {
      setPlans(data);
    }
  }, [setPlans, showNotification]);

  // Fetch plans on mount
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors for the field being edited
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (form.price === '' || parseFloat(form.price) < 0) newErrors.price = 'Price must be a non-negative number';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (parseInt(form.max_users_per_store) < 1) newErrors.max_users_per_store = 'At least 1 user required';
    if (parseInt(form.max_stores) < 1) newErrors.max_stores = 'At least 1 store required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission (create or update)
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      name: form.name,
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

    if (form.id) {
      // Update existing plan
      const { error } = await supabase
        .from('subscription_plans')
        .update(payload)
        .eq('id', form.id);
      if (error) {
        showNotification('Error updating plan', 'error');
        console.error('Update error:', error);
      } else {
        showNotification('Plan updated successfully', 'success');
        fetchPlans();
        resetForm();
      }
    } else {
      // Create new plan
      const { error } = await supabase
        .from('subscription_plans')
        .insert([payload]);
      if (error) {
        showNotification('Error creating plan', 'error');
        console.error('Create error:', error);
      } else {
        showNotification('Plan created successfully', 'success');
        fetchPlans();
        resetForm();
      }
    }
  };

  // Handle edit button click
  const handleEdit = (plan) => {
    setForm({
      id: plan.id,
      name: plan.name,
      price: plan.price.toString(),
      description: plan.description,
      max_users_per_store: plan.max_users_per_store || 1,
      max_stores: plan.max_stores || 1,
      max_products: plan.max_products || 50,
      has_warehouse: plan.has_warehouse || false,
      has_admin_ops: plan.has_admin_ops || false,
      has_ai_insights: plan.has_ai_insights || false,
      has_financial_dashboard: plan.has_financial_dashboard || false,
      has_multi_store: plan.has_multi_store || false
    });
    setErrors({});
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
    if (error) {
      showNotification('Error deleting plan', 'error');
      console.error('Delete error:', error);
    } else {
      showNotification('Plan deleted successfully', 'success');
      fetchPlans();
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
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
    setErrors({});
  };

  return (
    <div className="w-full px-4 sm:px-8 py-6 bg-gray-100 min-h-screen">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded text-white z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center text-indigo-900">
        Super Admin: Plan & Feature Management
      </h1>

      {/* Form */}
      <div className="bg-white shadow-xl rounded-2xl px-6 pt-6 pb-8 mb-8 max-w-4xl mx-auto border border-gray-200">
        <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
          {form.id ? 'Edit Plan' : 'Create New Plan'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Core Data */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-gray-700 font-bold text-sm mb-1">Plan Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. BUSINESS"
                className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold text-sm mb-1">Price ($)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold text-sm mb-1">Max Users</label>
              <input
                type="number"
                name="max_users_per_store"
                value={form.max_users_per_store}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold text-sm mb-1">Max Stores</label>
              <input
                type="number"
                name="max_stores"
                value={form.max_stores}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold text-sm mb-1">Max Products (-1=∞)</label>
              <input
                type="number"
                name="max_products"
                value={form.max_products}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-700 font-bold text-sm mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Right Column: Feature Toggles */}
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
            <label className="block text-indigo-900 font-bold text-sm mb-3 uppercase tracking-wider">Features Access</label>
            <div className="space-y-3">
              {[
                { name: 'has_warehouse', label: 'Warehouse Management' },
                { name: 'has_admin_ops', label: 'Admin Operations' },
                { name: 'has_ai_insights', label: 'AI Insights' },
                { name: 'has_financial_dashboard', label: 'Financial Dashboard' },
                { name: 'has_multi_store', label: 'Multi-Store Database' },
              ].map(feat => (
                <label key={feat.name} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name={feat.name}
                    checked={form[feat.name]}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">{feat.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-indigo-900 text-white py-3 rounded-xl font-bold hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
          >
            {form.id ? 'Save Plan Updates' : 'Create Subscription Plan'}
          </button>
          {form.id && (
            <button
              onClick={resetForm}
              className="px-8 bg-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto overflow-hidden shadow-2xl rounded-2xl border border-gray-200">
        <table className="w-full bg-white text-left border-collapse">
          <thead className="bg-indigo-900 text-white">
            <tr className="text-xs uppercase tracking-wider">
              <th className="py-4 px-6 font-bold">Plan Details</th>
              <th className="py-4 px-6 font-bold">Limits</th>
              <th className="py-4 px-6 font-bold text-center">Warehouse</th>
              <th className="py-4 px-6 font-bold text-center">Admin Ops</th>
              <th className="py-4 px-6 font-bold text-center">AI/Finance</th>
              <th className="py-4 px-6 font-bold text-center">Multi-Store</th>
              <th className="py-4 px-6 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plans.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-gray-400 italic font-medium">No plans found.</td>
              </tr>
            ) : (
              plans.sort((a, b) => a.price - b.price).map((plan) => (
                <tr key={plan.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{plan.name}</div>
                    <div className="text-xs font-bold text-indigo-600 mt-0.5">${plan.price.toFixed(2)} / month</div>
                    <div className="text-[10px] text-gray-400 mt-1 max-w-[150px] line-clamp-1">{plan.description}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1.5"><span className="w-1 h-1 bg-indigo-400 rounded-full"></span><span className="font-bold">{plan.max_users_per_store}</span> Users</div>
                      <div className="flex items-center gap-1.5"><span className="w-1 h-1 bg-indigo-400 rounded-full"></span><span className="font-bold">{plan.max_stores}</span> Stores</div>
                      <div className="flex items-center gap-1.5"><span className="w-1 h-1 bg-indigo-400 rounded-full"></span><span className="font-bold">{plan.max_products === -1 ? '∞' : plan.max_products}</span> Products</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {plan.has_warehouse ? <span className="text-emerald-500 font-bold text-xl">✓</span> : <span className="text-gray-200">✕</span>}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {plan.has_admin_ops ? <span className="text-emerald-500 font-bold text-xl">✓</span> : <span className="text-gray-200">✕</span>}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {plan.has_ai_insights || plan.has_financial_dashboard ? (
                      <div className="flex flex-col items-center gap-1">
                        {plan.has_ai_insights && <span className="text-[9px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">AI</span>}
                        {plan.has_financial_dashboard && <span className="text-[9px] font-bold bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">FIN</span>}
                      </div>
                    ) : <span className="text-gray-200">✕</span>}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {plan.has_multi_store ? <span className="text-emerald-500 font-bold text-xl">✓</span> : <span className="text-gray-200">✕</span>}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"
                        title="Edit Plan"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all"
                        title="Delete Plan"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionPlansCRUD;
