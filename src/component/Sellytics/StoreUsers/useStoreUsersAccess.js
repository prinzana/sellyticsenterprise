import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { featureKeyMapping } from './storeUsersToolsConfig';
import { getEffectivePlan, PLANS } from '../../../utils/planManager';

export default function useStoreUsersAccess() {
  const [shopName, setShopName] = useState('Store Owner');
  const [allowedFeatures, setAllowedFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [userPlan, setUserPlan] = useState(PLANS.FREE);
  const [registrationDate, setRegistrationDate] = useState(null);
  const [subscription, setSubscription] = useState(null);

  const fetchAllowedFeatures = async () => {
    try {
      setIsLoading(true);
      setError('');
      const storeId = localStorage.getItem('store_id');
      const userId = localStorage.getItem('user_id');
      let hasPremiumAccess = false;
      let fetchedShopName = 'Store Owner';
      let features = [];

      if (!storeId) {
        setError('No store assigned. Contact your admin.');
        setAllowedFeatures([]);
        setIsLoading(false);
        return;
      }

      if (!userId) {
        setError('User not authenticated. Please log in.');
        setAllowedFeatures([]);
        setIsLoading(false);
        return;
      }

      // Fetch store features and premium status (including plan for RBAC)
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('shop_name, allowed_features, premium, plan, created_at, owner_user_id')
        .eq('id', storeId)
        .single();

      if (storeError) {
        setError('Failed to load store permissions.');
        setAllowedFeatures([]);
        setIsLoading(false);
        return;
      }

      fetchedShopName = storeData?.shop_name || 'Store Owner';
      // Fetch the PARENT owner's subscription via RPC (bypasses RLS)
      let subData = null;
      const ownerId = storeData?.owner_user_id;

      if (ownerId) {
        const { data: rpcResult } = await supabase
          .rpc('get_owner_subscription', { p_owner_id: Number(ownerId) });
        subData = Array.isArray(rpcResult) && rpcResult.length > 0 ? rpcResult[0] : null;
      } else {
        // Fallback: try own subscription
        const { data: fallback } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('store_id', storeId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        subData = fallback;
      }

      setSubscription(subData || null);

      // Determine effective plan from subscription
      let effectivePlan = PLANS.FREE;
      if (subData) {
        if (subData.status === 'active') {
          effectivePlan = subData.plan_name || PLANS.BUSINESS;
        } else if (subData.status === 'trialing' && subData.trial_end) {
          effectivePlan = new Date(subData.trial_end) > new Date()
            ? (subData.plan_name || PLANS.BUSINESS)
            : PLANS.FREE;
        }
      } else {
        // Legacy fallback
        effectivePlan = getEffectivePlan(storeData.plan || PLANS.FREE, storeData.created_at);
      }

      setUserPlan(effectivePlan);
      // We use store's created_at for trial calculations to match useDashboardAccess
      setRegistrationDate(subData ? subData.created_at : storeData.created_at);

      hasPremiumAccess = effectivePlan === PLANS.PREMIUM || effectivePlan === PLANS.BUSINESS;

      if (hasPremiumAccess) {
        setIsPremium(true);
      }

      // Parse store features
      if (Array.isArray(storeData?.allowed_features)) {
        features = storeData.allowed_features
          .map((item) => {
            const normalized = item?.trim().toLowerCase();
            return featureKeyMapping[normalized] || normalized;
          })
          .filter(Boolean);
      } else if (storeData?.allowed_features === '' || storeData?.allowed_features === '""') {
        features = [];
      } else if (typeof storeData?.allowed_features === 'string') {
        try {
          const parsed = JSON.parse(storeData.allowed_features);
          if (Array.isArray(parsed)) {
            features = parsed
              .map((item) => {
                const normalized = item?.trim().toLowerCase();
                return featureKeyMapping[normalized] || normalized;
              })
              .filter(Boolean);
          } else {
            setError('Invalid store feature data.');
            features = [];
          }
        } catch (e) {
          setError('Invalid store feature data.');
          features = [];
        }
      }

      // Fetch user features from store_users
      const { data: userData, error: userError } = await supabase
        .from('store_users')
        .select('allowed_features')
        .eq('id', userId)
        .eq('store_id', storeId)
        .single();

      if (userError) {
        setError('Failed to load user permissions.');
        setAllowedFeatures([]);
        setIsLoading(false);
        return;
      }

      let userFeatures = [];
      if (Array.isArray(userData?.allowed_features)) {
        userFeatures = userData.allowed_features
          .map((item) => {
            const normalized = item?.trim().toLowerCase();
            return featureKeyMapping[normalized] || normalized;
          })
          .filter(Boolean);
      } else if (userData?.allowed_features === '' || userData?.allowed_features === '""') {
        userFeatures = [];
      } else if (typeof userData?.allowed_features === 'string') {
        try {
          const parsed = JSON.parse(userData.allowed_features);
          if (Array.isArray(parsed)) {
            userFeatures = parsed
              .map((item) => {
                const normalized = item?.trim().toLowerCase();
                return featureKeyMapping[normalized] || normalized;
              })
              .filter(Boolean);
          } else {
            setError('Invalid user feature data.');
            userFeatures = [];
          }
        } catch (e) {
          setError('Invalid user feature data.');
          userFeatures = [];
        }
      }

      // NOTE: Legacy premium checks via store_users and user_access removed.
      // Premium access is now derived solely from the subscription table.

      // ─── Auto-inject features from server-side flags (ADDITIVE only) ────────
      if (subData) {
        const serverFeatures = [
          { flag: 'has_warehouse', key: 'warehouse' },
          { flag: 'has_admin_ops', key: 'admin_ops' },
          { flag: 'has_ai_insights', key: 'ai_insights' },
          { flag: 'has_financial_dashboard', key: 'financial_dashboard' },
          { flag: 'has_multi_store', key: 'multi_store' },
        ];

        serverFeatures.forEach(({ flag, key }) => {
          if (subData[flag] === true) {
            if (!features.includes(key)) features.push(key);
            if (!userFeatures.includes(key)) userFeatures.push(key);
          }
        });
      }

      // ─── Plan-based injection (ALWAYS runs as fallback) ────────
      // This matches StoreDashboard/useDashboardAccess logic exactly.
      if (effectivePlan === PLANS.BUSINESS) {
        const businessFeatures = ['warehouse', 'admin_ops', 'ai_insights', 'financial_dashboard'];
        businessFeatures.forEach(f => {
          if (!features.includes(f)) features.push(f);
          if (!userFeatures.includes(f)) userFeatures.push(f);
        });
      } else if (effectivePlan === PLANS.PREMIUM) {
        const premiumFeatures = ['ai_insights', 'financial_dashboard'];
        premiumFeatures.forEach(f => {
          if (!features.includes(f)) features.push(f);
          if (!userFeatures.includes(f)) userFeatures.push(f);
        });
      }

      // Intersect store and user features
      const effectiveFeatures = features
        .map((f) => featureKeyMapping[f] || f)
        .filter((f) => userFeatures.includes(f));

      setShopName(fetchedShopName);
      setIsPremium(hasPremiumAccess);
      setAllowedFeatures(effectiveFeatures);
      if (!hasPremiumAccess) {
        setError('Some features are available only for premium users. Please upgrade your stores subscription.');
      }
    } catch (err) {
      setError('An error occurred while loading permissions.');
      setAllowedFeatures([]);
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
    isLoading,
    error,
    setError,
    isPremium,
    userPlan,
    registrationDate,
    subscription,
    refreshPermissions: fetchAllowedFeatures,
  };
}