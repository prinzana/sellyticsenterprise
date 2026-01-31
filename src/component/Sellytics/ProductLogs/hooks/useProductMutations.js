import offlineDB from '../db/offlineDB';
import { toast } from 'react-hot-toast';
import { useProductFormatter } from './useProductFormatter';

export function useProductMutations(storeId, isOnline, supabaseRef, products, setProducts, refreshProducts) {
  const { formatProduct } = useProductFormatter();

  const createProduct = async (productData) => {
    if (!storeId) throw new Error('No store selected');

    const product = {
      store_id: Number(storeId),
      name: productData.name?.trim(),
      description: productData.description?.trim() || null,
      purchase_price: Number(productData.purchase_price) || 0,
      selling_price: Number(productData.selling_price) || 0,
      purchase_qty: productData.purchase_qty || 0,
      suppliers_name: productData.suppliers_name?.trim() || null,
      is_unique: productData.is_unique || false,
      dynamic_product_imeis: productData.dynamic_product_imeis || null,
      device_size: productData.device_size || null,
      device_id: productData.device_id || null,
      created_at: new Date().toISOString()
    };

    try {
      if (isOnline && supabaseRef.current) {
        // 1️⃣ Insert product
        const { data, error } = await supabaseRef.current
          .from('dynamic_product')
          .insert(product)
          .select()
          .single();
        if (error) throw error;

        // 2️⃣ Upsert inventory
        await supabaseRef.current
          .from('dynamic_inventory')
          .upsert({
            dynamic_product_id: data.id,
            store_id: Number(storeId),
            available_qty: data.purchase_qty || 0,
            quantity_sold: 0,
            last_updated: new Date().toISOString()
          }, { onConflict: ['dynamic_product_id', 'store_id'] });

        // 3️⃣ Cache locally (real-time subscription will add to state)
        await offlineDB.cacheProducts([data], storeId);
        // Note: Don't call setProducts here - the real-time subscription handles INSERT events
        toast.success('Product created online');
        return data;
      } else {
        // Offline: queue for sync
        const localProduct = await offlineDB.addProduct(product, storeId);
        setProducts(prev => [formatProduct(localProduct), ...prev]);
        toast('Product queued for sync', { icon: '📴' });
        return localProduct;
      }
    } catch (err) {
      console.error('Create product error:', err);

      // Check for duplicate product name constraint violation
      if (err.code === '23505' || err.message?.includes('unique_store_product_name') || err.message?.includes('duplicate key')) {
        const friendlyError = new Error(`A product named "${productData.name}" already exists in this store. Please use a different name.`);
        friendlyError.isDuplicate = true;
        throw friendlyError;
      }

      toast.error(err.message || 'Failed to create product');
      throw err;
    }
  };



  const updateProduct = async (productId, updates, addedQty = 0) => {
    if (!storeId) throw new Error('No store selected');

    try {
      if (isOnline && supabaseRef.current) {
        // 1️⃣ Update the product table
        const { data: updated, error } = await supabaseRef.current
          .from('dynamic_product')
          .update(updates)
          .eq('id', productId)
          .select()
          .single();
        if (error) throw error;

        // 2️⃣ Fetch current inventory
        const { data: inv } = await supabaseRef.current
          .from('dynamic_inventory')
          .select('available_qty, quantity_sold')
          .eq('dynamic_product_id', productId)
          .eq('store_id', storeId)
          .maybeSingle();

        let newQty = inv?.available_qty || 0;

        // 3️⃣ Compute added quantity for unique products
        if (updated.is_unique && updates.dynamic_product_imeis) {
          const oldImeis = updated.dynamic_product_imeis
            ? updated.dynamic_product_imeis.split(',').map(i => i.trim()).filter(Boolean)
            : [];

          const incomingImeis = updates.dynamic_product_imeis
            .split(',')
            .map(i => i.trim())
            .filter(Boolean);

          // Only count the IMEIs that were newly added
          const newlyAddedCount = incomingImeis.length - oldImeis.length;
          newQty += newlyAddedCount > 0 ? newlyAddedCount : 0;

        } else {
          // Non-unique product
          newQty += (updates.purchase_qty || 0) + addedQty;
        }

        // 4️⃣ Upsert inventory
        await supabaseRef.current
          .from('dynamic_inventory')
          .upsert({
            dynamic_product_id: productId,
            store_id: Number(storeId),
            available_qty: newQty,
            quantity_sold: inv?.quantity_sold || 0,
            last_updated: new Date().toISOString()
          }, { onConflict: ['dynamic_product_id', 'store_id'] });

        // 5️⃣ Cache locally
        await offlineDB.cacheProducts([updated], storeId);
        setProducts(prev => prev.map(p => (p.id === productId ? formatProduct(updated) : p)));
        toast.success('Product updated online');
        return updated;

      } else {
        // Offline: queue update
        const updated = await offlineDB.updateProduct(productId, updates);
        setProducts(prev => prev.map(p => (p.id === productId ? formatProduct(updated) : p)));
        toast('Product update queued for sync', { icon: '📴' });
        return updated;
      }
    } catch (err) {
      console.error('Update product error:', err);
      toast.error(err.message || 'Failed to update product');
      throw err;
    }
  };



  const deleteProduct = async (productId) => {
    if (!storeId) throw new Error('No store selected');

    try {
      if (isOnline && supabaseRef.current) {
        await supabaseRef.current.from('dynamic_product').delete().eq('id', productId);
        await supabaseRef.current.from('dynamic_inventory')
          .delete()
          .eq('dynamic_product_id', productId)
          .eq('store_id', storeId);

        await offlineDB.permanentlyDeleteProduct(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast.success('Product deleted online');
      } else {
        await offlineDB.deleteProduct(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast('Product deletion queued for sync', { icon: '📴' });
      }
    } catch (err) {
      console.error('Delete product error:', err);
      toast.error(err.message || 'Failed to delete product');
      throw err;
    }
  };

  const getProductById = async (productId) => {
    try {
      const cached = await offlineDB.getProductById(productId);
      if (cached) return formatProduct(cached);

      if (isOnline && supabaseRef.current) {
        const { data } = await supabaseRef.current
          .from('dynamic_product')
          .select('*')
          .eq('id', productId)
          .single();
        if (data) return formatProduct(data);
      }
      return null;
    } catch (err) {
      console.error('Get product error:', err);
      return null;
    }
  };

  return { createProduct, updateProduct, deleteProduct, getProductById };
}
