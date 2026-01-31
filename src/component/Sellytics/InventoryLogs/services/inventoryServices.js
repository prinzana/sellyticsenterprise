/**
 * SwiftInventory - Inventory Service
 * Handles all Supabase operations for inventory management
 */
import { supabase } from '../../../../supabaseClient';
import * as inventoryCache from '../../db/inventoryCache';


const inventoryService = {
  // ==================== IDENTITY ====================
  getIdentity() {
    const storeId = localStorage.getItem('store_id');
    const userEmail = (localStorage.getItem('user_email') || '').trim().toLowerCase();
    return { storeId: storeId ? parseInt(storeId) : null, userEmail };
  },

  // ==================== FETCH OPERATIONS ====================
  async fetchProducts(storeId) {
    const { data, error } = await supabase
      .from('dynamic_product')
      .select('*')
      .eq('store_id', storeId)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async fetchInventory(storeId) {
    const { data, error } = await supabase
      .from('dynamic_inventory')
      .select(`
        id,
        dynamic_product_id,
        available_qty,
        quantity_sold,
        store_id,

        updated_at,
        dynamic_product (
          id,
          name,
          selling_price,
          purchase_price,
          is_unique,
          dynamic_product_imeis,
          device_size,
          description
        )
      `)
      .eq('store_id', storeId);

    if (error) throw error;
    return data || [];
  },

  async fetchCustomers(storeId) {
    const { data, error } = await supabase
      .from('customer')
      .select('id, fullname, email')
      .eq('store_id', storeId);

    if (error) throw error;
    return data || [];
  },

  // ==================== PRODUCT OPERATIONS ====================
  async updateProduct(productId, updates) {
    const { data, error } = await supabase
      .from('dynamic_product')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505' && error.message.includes('unique_store_product_name')) {
        throw new Error('A product with this name already exists in your store.');
      }
      throw error;
    }
    return data;
  },

  async deleteProduct(productId) {
    const { error } = await supabase
      .from('dynamic_product')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return true;
  },
  async adjustStock(inventoryId, difference, reason, userEmail) {
    try {
      const { data: inv, error: fetchErr } = await supabase
        .from('dynamic_inventory')
        .select('available_qty, dynamic_product_id, store_id')
        .eq('id', inventoryId)
        .single();

      if (fetchErr) throw fetchErr;

      const oldQty = inv.available_qty;
      const newQty = Math.max(0, oldQty + difference);

      const { error: updateErr } = await supabase
        .from('dynamic_inventory')
        .update({
          available_qty: newQty,
          updated_at: new Date().toISOString()
        })
        .eq('id', inventoryId);

      if (updateErr) throw updateErr;

      await this.logAdjustment({
        store_id: inv.store_id,
        dynamic_product_id: inv.dynamic_product_id,
        dynamic_inventory_id: inventoryId,
        old_quantity: oldQty,
        new_quantity: newQty,
        reason,
        updated_by_email: userEmail
      });

      return { oldQty, newQty };
    } catch (err) {
      // 🔥 OFFLINE QUEUE
      await inventoryCache.queueInventoryAdjustment(
        inventoryId,
        this.getIdentity().storeId,
        difference,
        reason
      );

      return { offline: true };
    }
  },








  async restockProduct(productId, storeId, quantity, reason, userEmail) {
    try {
      const { data: inv, error: fetchErr } = await supabase
        .from('dynamic_inventory')
        .select('id, available_qty')
        .eq('dynamic_product_id', productId)
        .eq('store_id', storeId)
        .single();

      if (fetchErr) throw fetchErr;

      const oldQty = inv.available_qty;
      const newQty = oldQty + quantity;

      const { error: updateErr } = await supabase
        .from('dynamic_inventory')
        .update({
          available_qty: newQty,
          updated_at: new Date().toISOString()
        })
        .eq('id', inv.id);

      if (updateErr) throw updateErr;

      await this.logAdjustment({
        store_id: storeId,
        dynamic_product_id: productId,
        dynamic_inventory_id: inv.id,
        old_quantity: oldQty,
        new_quantity: newQty,
        reason: reason || 'Restock',
        updated_by_email: userEmail
      });

      return { oldQty, newQty };
    } catch (err) {
      // 🔥 OFFLINE QUEUE
      await inventoryCache.queueInventoryAdjustment(
        productId,
        storeId,
        quantity,
        reason || 'Offline restock'
      );

      return { offline: true };
    }
  },

  async restockProductsBulk(items, storeId, userEmail) {
    const results = { successful: [], failed: [], offline: false };

    try {
      // Process each item
      const promises = items.map(async (item) => {
        try {
          if (item.isUnique && item.deviceIds && item.deviceIds.length > 0) {
            // For unique items, add each IMEI individually
            for (const imei of item.deviceIds) {
              await this.addImei(
                item.productId,
                imei,
                storeId,
                userEmail
              );
            }
            return { success: true, item };
          } else if (!item.isUnique && item.quantity > 0) {
            // For non-unique items, use standard restock
            await this.restockProduct(
              item.productId,
              storeId,
              item.quantity,
              item.reason,
              userEmail
            );
            return { success: true, item };
          } else {
            return { success: false, item, error: 'Invalid item configuration' };
          }
        } catch (err) {
          console.error(`Failed to restock ${item.name}:`, err);
          return { success: false, item, error: err };
        }
      });

      const outcomes = await Promise.all(promises);

      results.successful = outcomes.filter(o => o.success).map(o => o.item);
      results.failed = outcomes.filter(o => !o.success);

      return results;
    } catch (err) {
      console.error("Bulk restock fatal error:", err);
      throw err;
    }
  },






  async addImei(productId, imei, storeId, userEmail) {
    try {
      const { data: product, error: fetchErr } = await supabase
        .from('dynamic_product')
        .select('dynamic_product_imeis')
        .eq('id', productId)
        .single();

      if (fetchErr) throw fetchErr;

      const currentImeis = product.dynamic_product_imeis
        ? product.dynamic_product_imeis.split(',').map(i => i.trim()).filter(Boolean)
        : [];

      if (currentImeis.map(i => i.toLowerCase()).includes(imei.toLowerCase())) {
        throw new Error('IMEI already exists for this product.');
      }

      const newImeis = [...currentImeis, imei].join(',');

      const { error: updateErr } = await supabase
        .from('dynamic_product')
        .update({ dynamic_product_imeis: newImeis })
        .eq('id', productId);

      if (updateErr) throw updateErr;

      await this.updateInventoryFromImeis(
        productId,
        storeId,
        currentImeis.length + 1,
        userEmail,
        'Added IMEI'
      );

      return { success: true };
    } catch (err) {
      // 🔥 OFFLINE FALLBACK

      await inventoryCache.queueOfflineAction({
        entity_type: 'imei',
        operation: 'add',
        entity_id: productId,
        store_id: storeId,
        data: { imei }
      });

      // ✅ Optimistic local increment (NO currentImeis needed)
      const inventory = await inventoryCache.getInventoryByProductId(productId, storeId);
      if (inventory) {
        await inventoryCache.updateCachedInventory(
          productId,
          storeId,
          inventory.available_qty + 1,
          'Offline IMEI add'
        );
      }

      return { offline: true };
    }
  }
  ,


  async removeImei(productId, imei, storeId, userEmail) {
    // Get current product
    const { data: product, error: fetchErr } = await supabase
      .from('dynamic_product')
      .select('dynamic_product_imeis')
      .eq('id', productId)
      .single();

    if (fetchErr) throw fetchErr;

    const currentImeis = product.dynamic_product_imeis
      ? product.dynamic_product_imeis.split(',').map(i => i.trim()).filter(Boolean)
      : [];



    // Remove IMEI
    const newImeis = currentImeis.filter(i => i.toLowerCase() !== imei.toLowerCase());

    const { error: updateErr } = await supabase
      .from('dynamic_product')
      .update({ dynamic_product_imeis: newImeis.join(',') })
      .eq('id', productId);

    if (updateErr) throw updateErr;

    // Update inventory count
    await this.updateInventoryFromImeis(productId, storeId, newImeis.length, userEmail, 'Removed IMEI');

    return true;
  },




  async updateInventoryFromImeis(productId, storeId, totalImeiCount, userEmail, reason) {
    const { data: inv, error: fetchErr } = await supabase
      .from('dynamic_inventory')
      .select('id, available_qty, quantity_sold')
      .eq('dynamic_product_id', productId)
      .eq('store_id', storeId)
      .single();

    if (fetchErr) return; // Inventory may not exist yet

    // Calculate actual available quantity based on Total IMEIs - Sold Count
    const quantitySold = inv.quantity_sold || 0;
    const newAvailableQty = Math.max(0, totalImeiCount - quantitySold);

    const oldQty = inv.available_qty;
    const difference = newAvailableQty - oldQty;

    if (difference !== 0) {
      await supabase
        .from('dynamic_inventory')
        .update({
          available_qty: newAvailableQty,
          updated_at: new Date().toISOString()
        })
        .eq('id', inv.id);

      await this.logAdjustment({
        store_id: storeId,
        dynamic_product_id: productId,
        dynamic_inventory_id: inv.id,
        old_quantity: oldQty,
        new_quantity: newAvailableQty,
        reason,
        updated_by_email: userEmail
      });
    }
  },

  // ==================== LOGGING ====================
  async logAdjustment(data) {
    const { error } = await supabase
      .from('product_inventory_adjustments_logs')
      .insert(data);

    if (error) console.error('Failed to log adjustment:', error);
  },

  async deleteActivityLog(logId) {
    const { error } = await supabase
      .from('product_inventory_adjustments_logs')
      .delete()
      .eq('id', logId);

    if (error) throw error;
    return true;
  },

  async clearActivityLogs(storeId) {
    const { error } = await supabase
      .from('product_inventory_adjustments_logs')
      .delete()
      .eq('store_id', storeId);

    if (error) throw error;
    return true;
  },

  // ==================== PERMISSIONS ====================
  async checkPermissions(storeId, userEmail) {
    let canAdjust = false;
    let canDelete = false;
    let isOwner = false;

    try {
      // Check if store owner
      const { data: storeData } = await supabase
        .from('stores')
        .select('email_address')
        .eq('id', storeId)
        .single();

      if (storeData?.email_address?.toLowerCase() === userEmail) {
        isOwner = true;
        canAdjust = true;
        canDelete = true;
        return { isOwner, canAdjust, canDelete };
      }

      // Check store_users
      const { data: userData } = await supabase
        .from('store_users')
        .select('role')
        .eq('store_id', storeId)
        .eq('email_address', userEmail)
        .single();

      if (userData) {
        const role = userData.role.toLowerCase();
        canAdjust = ['store', 'manager', 'admin', 'md', 'inventory', 'sales'].includes(role);
        canDelete = ['manager', 'admin', 'md'].includes(role);
      }
    } catch (err) {
      console.error('Permission check failed:', err);
    }

    return { isOwner, canAdjust, canDelete };
  },

  // ==================== ANALYTICS ====================
  async fetchSalesTrends(productId, storeId) {
    const { data, error } = await supabase
      .from('dynamic_sales')
      .select('id, quantity, amount, sold_at')
      .eq('dynamic_product_id', productId)
      .eq('store_id', storeId)
      .order('sold_at', { ascending: true });

    if (error) return [];

    // Aggregate by day
    const byDay = {};
    (data || []).forEach(sale => {
      const day = sale.sold_at.split('T')[0];
      if (!byDay[day]) byDay[day] = { day, qty: 0, amount: 0 };
      byDay[day].qty += sale.quantity;
      byDay[day].amount += Number(sale.amount);
    });

    return Object.values(byDay);
  },

  async fetchProfitability(productId, storeId) {
    // Get product cost
    const { data: product } = await supabase
      .from('dynamic_product')
      .select('purchase_price')
      .eq('id', productId)
      .single();

    if (!product) return { totalRevenue: 0, totalCost: 0, totalProfit: 0, margin: 0 };

    // Get sales
    const { data: sales } = await supabase
      .from('dynamic_sales')
      .select('quantity, amount')
      .eq('dynamic_product_id', productId)
      .eq('store_id', storeId);

    let revenue = 0;
    let cost = 0;
    (sales || []).forEach(s => {
      revenue += Number(s.amount);
      cost += Number(s.quantity) * Number(product.purchase_price || 0);
    });

    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { totalRevenue: revenue, totalCost: cost, totalProfit: profit, margin };
  },

  async fetchRestockHistory(productId, storeId) {
    const { data, error } = await supabase
      .from('product_inventory_adjustments_logs')
      .select('id, old_quantity, new_quantity, difference, reason, updated_by_email, created_at')
      .eq('dynamic_product_id', productId)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  async fetchStockForecast(productId, storeId) {
    // Get current inventory
    const { data: inv } = await supabase
      .from('dynamic_inventory')
      .select('available_qty')
      .eq('dynamic_product_id', productId)
      .eq('store_id', storeId)
      .single();

    if (!inv) return null;

    // Get last 30 days sales
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data: sales } = await supabase
      .from('dynamic_sales')
      .select('quantity')
      .eq('dynamic_product_id', productId)
      .eq('store_id', storeId)
      .gte('sold_at', since.toISOString());

    const totalQty = (sales || []).reduce((a, s) => a + s.quantity, 0);
    const dailyAvg = totalQty / 30;
    const daysLeft = dailyAvg > 0 ? inv.available_qty / dailyAvg : Infinity;

    return Math.round(daysLeft);
  }
};

export default inventoryService;