import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../supabaseClient";
import { toast } from "react-toastify";

export default function useAttendants(ownerId) {
  const [attendants, setAttendants] = useState([]);
  const [stores, setStores] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ================= LOAD DATA ================= */
  const loadAttendants = useCallback(async () => {
    setLoading(true);
    try {
      if (!ownerId) throw new Error("No owner ID found.");

      // 1️⃣ Fetch stores (ONLY source of shop_name)
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, shop_name")
        .eq("owner_user_id", ownerId);

      if (storeError) throw storeError;
      setStores(storeData || []);

      if (!storeData?.length) {
        setAttendants([]);
        setError("No stores found for this owner.");
        return;
      }

      const storeMap = Object.fromEntries(
        storeData.map((s) => [s.id, s.shop_name])
      );

      const storeIds = storeData.map((s) => s.id);

      // 2️⃣ Fetch branches
      const { data: branchData } = await supabase
        .from("branches")
        .select("id, branch_name, store_id")
        .in("store_id", storeIds);

      setBranches(branchData || []);

      // 3️⃣ Fetch attendants
      const { data: attendantsData, error: attendantsError } = await supabase
        .from("store_users")
        .select(`
          id,
          full_name,
          phone_number,
          email_address,
          role,
          store_id,
          branch_id
        `)
        .in("store_id", storeIds)
        .order("id", { ascending: false });

      if (attendantsError) throw attendantsError;

      // 4️⃣ Merge shop_name and branch_name manually
      const branchMap = Object.fromEntries(
        (branchData || []).map((b) => [b.id, b.branch_name])
      );

      setAttendants(
        (attendantsData || []).map((a) => ({
          ...a,
          shop_name: storeMap[a.store_id] || "N/A",
          branch_name: branchMap[a.branch_id] || "Main Office",
        }))
      );

      setError(null);
    } catch (err) {
      console.error(err);
      setAttendants([]);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    loadAttendants();
  }, [loadAttendants]);

  /* ================= CRUD ================= */

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

  const createAttendant = async (attendant) => {
    try {
      const { shop_name, branch_name, ...payload } = attendant;

      if (payload.password) {
        payload.password = await hashPassword(payload.password);
      }

      const { error } = await supabase
        .from("store_users")
        .insert([payload]);
      if (error) throw error;
      toast.success("Employees created successfully.");
      loadAttendants();
    } catch (err) {
      console.error(err.message);
      toast.error(err.message);
    }
  };

  const updateAttendant = async (attendant) => {
    try {
      const { id, shop_name, branch_name, password, ...payload } = attendant;

      // Only hash and update password if it's explicitly changed and not empty
      if (password && password.trim() !== "") {
        payload.password = await hashPassword(password);
      }

      const { error } = await supabase
        .from("store_users")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
      toast.success("Employees updated successfully.");
      loadAttendants();
    } catch (err) {
      console.error(err.message);
      toast.error(err.message);
    }
  };

  const deleteAttendant = async (id) => {
    try {
      const { error } = await supabase
        .from("store_users")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Employees deleted successfully.");
      loadAttendants();
    } catch (err) {
      console.error(err.message);
      toast.error(err.message);
    }
  };

  return {
    attendants,
    stores,
    branches,
    loading,
    error,
    loadAttendants,
    createAttendant,
    updateAttendant,
    deleteAttendant,
  };
}
