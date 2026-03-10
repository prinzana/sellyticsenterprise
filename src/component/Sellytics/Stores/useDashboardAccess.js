import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { featureKeyMapping } from './toolsConfig';
import { PLANS, getEffectivePlan } from '../../../utils/planManager';

/**
 * SINGLE SOURCE OF TRUTH for plan & feature access.
 * 
 * Priority chain:
 *   1. subscriptions table (active paid plan or live trial) → AUTHORITY
 *   2. stores.plan → FALLBACK only if no subscription exists
 *   3. stores.premium → DEPRECATED, ignored going forward
 * 
 * This hook is the ONLY place the effective plan is determined.
 * Every component that needs plan info should consume this hook.
 */
export default function useDashboardAccess() {
  const [shopName, setShopName] = useState('Store Owner');
  const [allowedFeatures, setAllowedFeatures] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [userPlan, setUserPlan] = useState(PLANS.FREE);
  const [registrationDate, setRegistrationDate] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isParentStore, setIsParentStore] = useState(false);

  const fetchAllowedFeatures = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const storeId = localStorage.getItem('store_id');

      if (!storeId) {
        setErrorMessage('Please log in to access the dashboard.');
        setIsLoading(false);
        return;
      }

      localStorage.removeItem(`features_${storeId}`);

      // ─── 1. Fetch store data ───────────────────────
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('shop_name, allowed_features, plan, created_at, owner_user_id')
        .eq('id', storeId)
        .single();

      if (storeError || !storeData) {
        setErrorMessage('Failed to load feature permissions. Please try again.');
        setIsLoading(false);
        return;
      }

      // ─── 1b. Determine parent status & fetch subscription ────────
      // Use owner_user_id from the DB (not localStorage) so child stores also resolve correctly
      const ownerId = storeData.owner_user_id || localStorage.getItem('owner_id');
      let subData = null;

      if (ownerId) {
        // Use RPC to fetch the parent's subscription (bypasses RLS)
        const { data: rpcResult } = await supabase
          .rpc('get_owner_subscription', { p_owner_id: Number(ownerId) });

        // RPC returns an array, take the first row
        subData = Array.isArray(rpcResult) && rpcResult.length > 0 ? rpcResult[0] : null;

        // NEW: If no subscription record found, fetch THIS plan's global defaults
        // This makes the FREE plan dynamic according to the Admin Dashboard
        if (!subData) {
          const planToFetch = storeData.plan || PLANS.FREE;
          const { data: planDefaults } = await supabase
            .from('subscription_plans')
            .select('*')
            .ilike('name', planToFetch)
            .single();

          if (planDefaults) {
            // Construct a "pseudo-subscription" object so features are inherited correctly
            subData = {
              ...planDefaults,
              status: 'active', // Default to active for plan blueprint
              plan_name: planDefaults.name,
              is_default_plan: true
            };
          }
        }

        // Determine if THIS store is the parent by checking if the subscription belongs to us
        if (subData) {
          setIsParentStore(subData.store_id === Number(storeId) || subData.is_default_plan);
        } else {
          // No subscription found — check if we're the oldest store manually
          setIsParentStore(!!localStorage.getItem('owner_id'));
        }
      } else {
        setIsParentStore(false);
      }

      setSubscription(subData || null);

      // ─── 3. Determine effective plan ────────
      // Priority: 
      // 1. "Real" subscription record from DB (paid or trialing)
      // 2. Legacy 21-day trial (calculated from registration date)
      // 3. Store's explicitly set plan or FREE
      const effectivePlan = getEffectivePlan(
        storeData.plan || PLANS.FREE,
        (subData && !subData.is_default_plan) ? subData : storeData.created_at
      );

      setUserPlan(effectivePlan);
      
      // We use store's created_at for trial calculations unless there's a real sub record
      setRegistrationDate((subData && !subData.is_default_plan) ? subData.created_at : storeData.created_at);

      // ─── 4. Premium access is now PURELY derived from effectivePlan ──
      const hasPremiumAccess = effectivePlan !== PLANS.FREE || (subData && subData.price > 0);

      // ─── 5. Parse allowed_features ────────────────────────
      let features = [];
      if (Array.isArray(storeData.allowed_features)) {
        features = storeData.allowed_features
          .map(item => {
            const normalized = item?.trim().toLowerCase();
            return featureKeyMapping[normalized] || normalized;
          })
          .filter(Boolean);
      } else if (typeof storeData.allowed_features === 'string') {
        try {
          const parsed = JSON.parse(storeData.allowed_features);
          if (Array.isArray(parsed)) {
            features = parsed
              .map(item => {
                const normalized = item?.trim().toLowerCase();
                return featureKeyMapping[normalized] || normalized;
              })
              .filter(Boolean);
          }
        } catch (e) {
          features = [];
        }
      }

      // ─── 6. Auto-inject features from server-side flags or plan defaults ──
      if (subData && !subData.is_default_plan) {
        const serverFeatures = [
          { flag: 'has_warehouse', key: 'warehouse' },
          { flag: 'has_admin_ops', key: 'admin_ops' },
          { flag: 'has_ai_insights', key: 'ai_insights' },
          { flag: 'has_financial_dashboard', key: 'financial_dashboard' },
          { flag: 'has_multi_store', key: 'multi_store' },
        ];

        serverFeatures.forEach(({ flag, key }) => {
          if (subData[flag] === true && !features.includes(key)) {
            features.push(key);
          }
        });
      }

      // ─── 6b. Legacy/Trial fallback: Inject core Business features ────────
      if (effectivePlan === PLANS.BUSINESS) {
        const businessFeatures = ['warehouse', 'admin_ops', 'ai_insights', 'financial_dashboard'];
        businessFeatures.forEach(key => {
          if (!features.includes(key)) features.push(key);
        });
      }

      // ─── 7. Set final state ──────────────────────────
      setShopName(storeData.shop_name || 'Store Owner');
      setIsPremium(hasPremiumAccess);
      setAllowedFeatures(features);

      if (!hasPremiumAccess && effectivePlan === PLANS.FREE) {
        setErrorMessage('Some features are available only for premium users. Please upgrade your store\'s subscription.');
      }
    } catch (err) {
      console.error('useDashboardAccess error:', err);
      setErrorMessage('An error occurred while loading permissions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllowedFeatures();
  }, []);

  return {
    shopName,
    allowedFeatures,
    isPremium,
    isLoading,
    errorMessage,
    setErrorMessage,
    userPlan,
    registrationDate,
    subscription,
    isParentStore,
    refreshPermissions: fetchAllowedFeatures,
  };
}
