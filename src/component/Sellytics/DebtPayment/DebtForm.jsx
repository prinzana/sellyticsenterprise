// DebtForm.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import toast from 'react-hot-toast';
import DebtPaymentManager from './DebtPaymentManager'; // Assuming you have a DebtHistory component



export default function DebtForm() {
  const store_id = Number(localStorage.getItem('store_id'));

  const [customers, setCustomers] = useState([]);
  const [, setProducts] = useState([]);
  const [newDebt, setNewDebt] = useState({
    customer_id: '',
   dynamic_product_id: '',
    amount_owed: ''
  });

  const [, setDebts] = useState([]);
  const [,] = useState({});
  const [,] = useState('');
  const [,] = useState(1);

  const fetchCustomers = useCallback(async () => {
    const { data, error } = await supabase
      .from('customer')
      .select('id,fullname')
      .eq('store_id', store_id)
      .order('fullname');
    if (error) toast.error('Failed to load customers');
    else setCustomers(data);
  }, [store_id]);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('dynamic_product')
      .select('id,name')
      .eq('store_id', store_id)
      .order('name');
    if (error) toast.error('Failed to load products');
    else setProducts(data);
  }, [store_id]);

  const fetchDebts = useCallback(async () => {
    const { data, error } = await supabase
      .from('debt_tracker')
      .select(`
        id,
        customer_id,
        dynamic_product_id,
        amount_owed,
        amount_deposited,
        debt_date,
        store_id,
        customer:customer_id(fullname),
        dynamic_product_id(name)
      `)
      .eq('store_id', store_id)
      .order('amount_remaining', { ascending: false });
    if (error) toast.error('Failed to load debts');
    else setDebts(data || []);
  }, [store_id]);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchDebts();
  }, [fetchCustomers, fetchProducts, fetchDebts]);

  const handleNewChange = e => {
    setNewDebt(d => ({ ...d, [e.target.name]: e.target.value }));
  };
  const handleAddDebt = async e => {
    e.preventDefault();
    const payload = {
      store_id,
      customer_id: Number(newDebt.customer_id),
      dynamic_product_id: newDebt.dynamic_product_id ? Number(newDebt.dynamic_product_id) : null,
      amount_owed: parseFloat(newDebt.amount_owed),
      amount_deposited: 0,
      debt_date: new Date().toISOString(),
      created_by_owner: store_id,
      created_by_user: null
    };
    const { error } = await supabase.from('debt_tracker').insert([payload]);
    if (error) toast.error(error.message);
    else {
      toast.success('Debt added');
      setNewDebt({ customer_id:'', dynamic_product_id:'', amount_owed:'' });
      fetchDebts();
    }
  };




  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-5 sm:mb-6">
          Add New Debt
        </h2>
        <form
          onSubmit={handleAddDebt}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full"
        >
          <select
            name="customer_id"
            value={newDebt.customer_id}
            onChange={handleNewChange}
            required
            className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none"
          >
            <option value="">Select Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.fullname}</option>
            ))}
          </select>

          <input
            type="number"
            name="amount_owed"
            placeholder="Amount Owed"
            step="0.01"
            value={newDebt.amount_owed}
            onChange={handleNewChange}
            required
            className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400"
          />

          <button
            type="submit"
            className="w-full py-3 sm:py-3.5 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-md active:scale-[0.98]"
          >
            Add Debt
          </button>
        </form>
      </div>

      <DebtPaymentManager key={Date.now()} />
    </div>
  );
}


