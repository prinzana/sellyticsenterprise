import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import toast from 'react-hot-toast';

export default function useReceiptManager(storeId, userEmail) {
  const [store, setStore] = useState(null);
  const [saleGroups, setSaleGroups] = useState([]);
  const [filteredSaleGroups, setFilteredSaleGroups] = useState([]);
  const [selectedSaleGroup, setSelectedSaleGroup] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canDelete, setCanDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ paymentMethod: 'all', dateRange: 'all' });

  // Check if user is store owner
  const checkIsOwner = useCallback(async (storeId, email) => {
    if (!email || !storeId) return false;
    const cleanEmail = email.trim().toLowerCase();
    
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('email_address')
        .eq('id', storeId)
        .single();
      
      if (error || !data) return false;
      return data.email_address?.trim().toLowerCase() === cleanEmail;
    } catch (error) {
      console.error('checkIsOwner error:', error);
      return false;
    }
  }, []);

  // Check if user is store staff
  const checkIsStoreUser = useCallback(async (storeId, email) => {
    if (!email || !storeId) return false;
    const cleanEmail = email.trim().toLowerCase();
    
    const { data, error } = await supabase
      .from('store_users')
      .select('id')
      .eq('store_id', storeId)
      .eq('email_address', cleanEmail)
      .maybeSingle();

    if (error) return false;
    return !!data;
  }, []);

  // Fetch store details
  useEffect(() => {
    if (!storeId) return;

    const fetchStore = async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('shop_name, business_address, phone_number, email_address')
        .eq('id', storeId)
        .single();

      if (error) {
        console.error('Store fetch error:', error);
        toast.error('Failed to load store details');
      } else {
        setStore(data);
      }
    };

    fetchStore();
  }, [storeId]);

  // Fetch sale groups
  const fetchSaleGroups = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sale_groups')
        .select(`
          id,
          store_id,
          total_amount,
          payment_method,
          created_at,
          customer_id,
          created_by_email,
          dynamic_sales (
            id,
            device_id,
            quantity,
            amount,
            dynamic_product (
              id,
              name,
              selling_price,
              dynamic_product_imeis
            )
          )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSaleGroups(data || []);
    } catch (err) {
      console.error('Sale groups fetch error:', err);
      toast.error('Failed to load sale groups');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchSaleGroups();

    if (!storeId) return;

    const subscription = supabase
      .channel('sale_groups_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sale_groups', filter: `store_id=eq.${storeId}` },
        () => fetchSaleGroups()
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [storeId, fetchSaleGroups]);



// Combined role-based filtering and search/filter logic - SINGLE EFFECT
useEffect(() => {
  console.log('🔄 Combined filtering effect triggered');
  console.log('State:', { userEmail, storeId, saleGroupsCount: saleGroups.length, searchTerm, filters });
  
  if (!userEmail || !storeId || saleGroups.length === 0) {
    console.log('⏳ Early return - Missing: userEmail?', !userEmail, 'storeId?', !storeId, 'saleGroups?', saleGroups.length === 0);
    setFilteredSaleGroups([]);
    setCanDelete(false);
    return;
  }

  const applyAllFilters = async () => {
    try {
      const cleanEmail = userEmail.trim().toLowerCase();
      console.log('🔍 Checking permissions for:', cleanEmail);
      
      // Step 1: Apply role-based filtering
      const isOwner = await checkIsOwner(storeId, userEmail);
      console.log('👤 Is Owner?', isOwner);
      
      const isStaff = await checkIsStoreUser(storeId, userEmail);
      console.log('👥 Is Staff?', isStaff);

      let roleFiltered = [];
      
      if (isOwner) {
        roleFiltered = saleGroups;
        console.log('✅ User is OWNER → canDelete = true, showing all receipts:', saleGroups.length);
        setCanDelete(true);
      } else if (isStaff) {
        roleFiltered = saleGroups.filter(
          sg => sg.created_by_email?.trim().toLowerCase() === cleanEmail
        );
        console.log('✅ User is STAFF → canDelete = false, showing own receipts:', roleFiltered.length);
        setCanDelete(false);
      } else {
        console.log('❌ User has no access to this store');
        setCanDelete(false);
        setFilteredSaleGroups([]);
        return;
      }

      // Step 2: Apply search and other filters on role-filtered data
      let filtered = [...roleFiltered];

      // Apply search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(sg => {
          const fields = [
            `#${sg.id}`,
            sg.total_amount?.toString(),
            sg.payment_method,
            new Date(sg.created_at).toLocaleDateString(),
            new Date(sg.created_at).toLocaleTimeString()
          ];
          return fields.some(f => f?.toLowerCase().includes(term));
        });
        console.log('🔎 After search filter:', filtered.length);
      }

      // Apply payment method filter
      if (filters.paymentMethod !== 'all') {
        filtered = filtered.filter(sg => 
          sg.payment_method?.toLowerCase() === filters.paymentMethod.toLowerCase()
        );
        console.log('💳 After payment method filter:', filtered.length);
      }

      // Apply date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        filtered = filtered.filter(sg => {
          const saleDate = new Date(sg.created_at);
          
          switch (filters.dateRange) {
            case 'today':
              return saleDate >= today;
            case 'yesterday':
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              return saleDate >= yesterday && saleDate < today;
            case 'week':
              const weekAgo = new Date(today);
              weekAgo.setDate(weekAgo.getDate() - 7);
              return saleDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(today);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return saleDate >= monthAgo;
            case 'year':
              const yearAgo = new Date(today);
              yearAgo.setFullYear(yearAgo.getFullYear() - 1);
              return saleDate >= yearAgo;
            default:
              return true;
          }
        });
        console.log('📅 After date range filter:', filtered.length);
      }

      console.log('📤 Final filtered result:', filtered.length, 'items');
      setFilteredSaleGroups(filtered);
    } catch (error) {
      console.error('❌ Error in filtering:', error);
      setFilteredSaleGroups([]);
      setCanDelete(false);
    }
  };

  applyAllFilters();
}, [saleGroups, userEmail, storeId, searchTerm, filters, checkIsOwner, checkIsStoreUser]);





  // Fetch or create receipt for a sale group
  const fetchOrCreateReceipt = useCallback(async (saleGroup) => {
    if (!saleGroup) return null;

    try {
      let { data: receiptData, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('sale_group_id', saleGroup.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Auto-create receipt if doesn't exist
      if (receiptData.length === 0 && saleGroup.dynamic_sales?.length > 0) {
        const totalQuantity = saleGroup.dynamic_sales.reduce((sum, s) => sum + s.quantity, 0);
        const totalAmount = saleGroup.dynamic_sales.reduce((sum, s) => sum + s.amount, 0);
        const firstSale = saleGroup.dynamic_sales[0];

        let customer_name = '';
        let phone_number = '';
        let customer_address = '';

        if (saleGroup.customer_id) {
          const { data: customer } = await supabase
            .from('customer')
            .select('fullname, phone_number, address')
            .eq('id', saleGroup.customer_id)
            .single();

          if (customer) {
            customer_name = customer.fullname || '';
            phone_number = customer.phone_number || '';
            customer_address = customer.address || '';
          }
        }

        const receiptInsert = {
          store_receipt_id: saleGroup.store_id,
          sale_group_id: saleGroup.id,
          product_id: firstSale.dynamic_product.id,
          sales_amount: totalAmount,
          sales_qty: totalQuantity,
          product_name: firstSale.dynamic_product.name,
          device_id: firstSale.device_id || null,
          customer_name,
          customer_address,
          phone_number,
          warranty: '',
          date: new Date(saleGroup.created_at).toISOString(),
          receipt_id: `RCPT-${saleGroup.id}-${Date.now()}`
        };

        const { data: newReceipt, error: insertError } = await supabase
          .from('receipts')
          .insert([receiptInsert])
          .select()
          .single();

        if (insertError) throw insertError;
        receiptData = [newReceipt];
      }

      // Remove duplicates
      if (receiptData.length > 1) {
        const latest = receiptData[0];
        await supabase
          .from('receipts')
          .delete()
          .eq('sale_group_id', saleGroup.id)
          .neq('id', latest.id);
        receiptData = [latest];
      }

      return receiptData[0] || null;
    } catch (err) {
      console.error('Receipt fetch error:', err);
      toast.error('Failed to load receipt');
      return null;
    }
  }, []);

  // Open receipt modal for a sale group
  const openReceiptModal = useCallback(async (saleGroup) => {
    setSelectedSaleGroup(saleGroup);
    const receipt = await fetchOrCreateReceipt(saleGroup);
    setSelectedReceipt(receipt);
  }, [fetchOrCreateReceipt]);

  // Update receipt and customer details
  const updateReceipt = useCallback(async (receiptId, updates) => {
    try {
      // Update customer if exists
      if (selectedSaleGroup?.customer_id) {
        await supabase
          .from('customer')
          .update({
            fullname: updates.customer_name,
            phone_number: updates.phone_number,
            address: updates.customer_address
          })
          .eq('id', selectedSaleGroup.customer_id);
      }

      // Update receipt
      const { error } = await supabase
        .from('receipts')
        .update(updates)
        .eq('id', receiptId);

      if (error) throw error;

      // Refresh receipt
      const updatedReceipt = await fetchOrCreateReceipt(selectedSaleGroup);
      setSelectedReceipt(updatedReceipt);

      toast.success('Receipt updated successfully');
      return true;
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update receipt');
      return false;
    }
  }, [selectedSaleGroup, fetchOrCreateReceipt]);

  // Delete single sale group
  const deleteSaleGroup = useCallback(async (saleGroupId) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete sales');
      return false;
    }

    if (!window.confirm('Delete this sale and its receipt? This cannot be undone.')) {
      return false;
    }

    try {
      await supabase.from('dynamic_sales').delete().eq('sale_group_id', saleGroupId);
      await supabase.from('receipts').delete().eq('sale_group_id', saleGroupId);
      await supabase.from('sale_groups').delete().eq('id', saleGroupId);

      await fetchSaleGroups();
      setSelectedSaleGroup(null);
      setSelectedReceipt(null);

      toast.success('Sale deleted successfully');
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete sale');
      return false;
    }
  }, [canDelete, fetchSaleGroups]);

  // Bulk delete sale groups
  const bulkDeleteSaleGroups = useCallback(async (saleGroupIds) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete sales');
      return false;
    }

    if (saleGroupIds.length === 0) {
      toast.error('No sales selected');
      return false;
    }

    if (!window.confirm(`Delete ${saleGroupIds.length} sale(s) and their receipts? This cannot be undone.`)) {
      return false;
    }

    const toastId = toast.loading(`Deleting ${saleGroupIds.length} sale(s)...`);

    try {
      await supabase.from('dynamic_sales').delete().in('sale_group_id', saleGroupIds);
      await supabase.from('receipts').delete().in('sale_group_id', saleGroupIds);
      await supabase.from('sale_groups').delete().in('id', saleGroupIds);

      await fetchSaleGroups();
      setSelectedIds([]);
      setSelectedSaleGroup(null);
      setSelectedReceipt(null);

      toast.success(`${saleGroupIds.length} sale(s) deleted`, { id: toastId });
      return true;
    } catch (err) {
      console.error('Bulk delete error:', err);
      toast.error('Failed to delete sales', { id: toastId });
      return false;
    }
  }, [canDelete, fetchSaleGroups]);

  // Get product groups for receipt
  const getProductGroups = useCallback((saleGroup) => {
    if (!saleGroup?.dynamic_sales) return [];

    return saleGroup.dynamic_sales.map(sale => {
      const product = sale.dynamic_product;
      const deviceIds = sale.device_id?.split(',').filter(id => id.trim()) || [];
      const quantity = sale.quantity;
      const unitPrice = sale.amount / sale.quantity;

      return {
        productId: product.id,
        productName: product.name,
        deviceIds,
        quantity,
        unitPrice,
        totalAmount: sale.amount
      };
    });
  }, []);

  return {
    store,
    saleGroups,
    filteredSaleGroups,
    selectedSaleGroup,
    selectedReceipt,
    loading,
    canDelete,
    selectedIds,
    setSelectedIds,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    openReceiptModal,
    updateReceipt,
    deleteSaleGroup,
    bulkDeleteSaleGroups,
    getProductGroups,
    fetchOrCreateReceipt,
    closeReceiptModal: () => {
      setSelectedSaleGroup(null);
      setSelectedReceipt(null);
    }
  };
}