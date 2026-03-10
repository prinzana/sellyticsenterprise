import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import toast from 'react-hot-toast';

export const useStores = (ownerId) => {
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState(localStorage.getItem('store_id') || '');
  const [isLoading, setIsLoading] = useState(false);

  const fetchStores = useCallback(async () => {
    if (!ownerId) {
      toast.error('No owner ID found. Please log in.');
      setStores([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const { data: storeData, error: storeErr } = await supabase
      .from('stores')
      .select('id, shop_name')
      .eq('owner_user_id', ownerId);
    
    if (storeErr) {
      toast.error('Error fetching stores: ' + storeErr.message);
      setStores([]);
      setIsLoading(false);
      return;
    }
    
    setStores(storeData || []);
    if (storeData.length === 0) {
      toast('No stores found for this owner.');
    } else if (!storeId && storeData.length > 0) {
      setStoreId(storeData[0].id);
      localStorage.setItem('store_id', storeData[0].id);
    }
    setIsLoading(false);
  }, [ownerId, storeId]);

  useEffect(() => {
    if (!ownerId) {
      toast.error('Please log in to view your stores.');
      setStores([]);
      return;
    }
    fetchStores();
  }, [ownerId, fetchStores]);

  const updateStoreId = useCallback((newStoreId) => {
    setStoreId(newStoreId);
    localStorage.setItem('store_id', newStoreId);
  }, []);

  return { stores, storeId, setStoreId: updateStoreId, isLoading };
};