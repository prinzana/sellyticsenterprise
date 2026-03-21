/**
 * Sellytics Plan & Permission Manager
 * Handles trial logic and feature gating
 * 
 * Now reads trial data from the `subscriptions` table (DB-level)
 * instead of calculating from `stores.created_at` (client-side).
 */

export const PLANS = {
    FREE: 'FREE',
    PREMIUM: 'PREMIUM',
    BUSINESS: 'BUSINESS'
};

// ─── PLAN LIMITS ────────────────────────────
export const PLAN_LIMITS = {
    [PLANS.FREE]: { maxUsersPerStore: 1, maxStores: 1, maxProducts: 50 },
    [PLANS.PREMIUM]: { maxUsersPerStore: 5, maxStores: 1, maxProducts: Infinity },
    [PLANS.BUSINESS]: { maxUsersPerStore: 10, maxStores: 3, maxProducts: Infinity },
};

/** Get the max products allowed for a given plan */
export const getProductLimit = (plan, subscription = null) => {
    if (subscription && typeof subscription === 'object' && subscription.max_products !== undefined) {
        return subscription.max_products === -1 ? Infinity : subscription.max_products;
    }
    return PLAN_LIMITS[plan]?.maxProducts ?? PLAN_LIMITS[PLANS.FREE].maxProducts;
};

/** Get the max users allowed per store for a given plan */
export const getUserLimit = (plan, subscription = null) => {
    if (subscription && typeof subscription === 'object' && subscription.max_users_per_store !== undefined) {
        return subscription.max_users_per_store;
    }
    return PLAN_LIMITS[plan]?.maxUsersPerStore ?? PLAN_LIMITS[PLANS.FREE].maxUsersPerStore;
};

/** Get the max stores allowed for a given plan */
export const getStoreLimit = (plan, subscription = null) => {
    if (subscription && typeof subscription === 'object' && subscription.max_stores !== undefined) {
        return subscription.max_stores;
    }
    return PLAN_LIMITS[plan]?.maxStores ?? PLAN_LIMITS[PLANS.FREE].maxStores;
};

/**
 * Checks if a subscription record represents an active trial
 * @param {object} subscription - The subscription row from the DB
 * @returns {boolean}
 */
export const isTrialActive = (subscription) => {
    if (!subscription) return false;

    // DB-level: check the subscription status and trial_end date
    if (subscription.status === 'trialing' && subscription.trial_end) {
        return new Date(subscription.trial_end) > new Date();
    }

    // Fallback: legacy client-side calculation from created_at
    if (subscription.created_at && !subscription.trial_end) {
        const registrationDate = new Date(subscription.created_at);
        const today = new Date();
        const diffDays = Math.ceil(Math.abs(today - registrationDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 21;
    }

    return false;
};

/**
 * Determines the "Effective Plan" based on subscription record
 * @param {string} currentPlan - The plan stored in stores.plan ('FREE', 'PREMIUM', 'BUSINESS')
 * @param {object|string} subscriptionOrCreatedAt - Either a subscription object or legacy createdAt string
 * @returns {string} One of PLANS constants
 */
export const getEffectivePlan = (currentPlan = PLANS.FREE, subscriptionOrCreatedAt) => {
    // If it's a subscription object (new DB-level approach)
    if (subscriptionOrCreatedAt && typeof subscriptionOrCreatedAt === 'object') {
        if (subscriptionOrCreatedAt.status === 'active') {
            return subscriptionOrCreatedAt.plan_name || currentPlan;
        }
        if (isTrialActive(subscriptionOrCreatedAt)) {
            return subscriptionOrCreatedAt.plan_name || PLANS.BUSINESS;
        }
        return currentPlan;
    }

    // Legacy fallback: subscriptionOrCreatedAt is a date string (created_at)
    if (subscriptionOrCreatedAt && typeof subscriptionOrCreatedAt === 'string') {
        const registrationDate = new Date(subscriptionOrCreatedAt);
        const today = new Date();
        const diffDays = Math.ceil(Math.abs(today - registrationDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 21) return PLANS.BUSINESS;
    }

    return currentPlan;
};

/**
 * Centralized permission check
 * Use this to hide/show buttons or protect routes
 */
export const hasFeature = (featureName, currentPlan, subscriptionOrCreatedAt) => {
    // 1. If we have a subscription object, check for server-side boolean flags.
    //    Server flags are ADDITIVE only: if true, grant access immediately.
    //    If false, do NOT block — fall through to plan-based logic instead.
    if (subscriptionOrCreatedAt && typeof subscriptionOrCreatedAt === 'object') {
        const featureMap = {
            'WAREHOUSE': 'has_warehouse',
            'ADMIN_OPS': 'has_admin_ops',
            'AI_INSIGHTS': 'has_ai_insights',
            'FINANCIAL_DASHBOARD': 'has_financial_dashboard',
            'MULTI_STORE': 'has_multi_store',
        };
        const serverField = featureMap[featureName];
        if (serverField && subscriptionOrCreatedAt[serverField] === true) {
            return true; // Server explicitly grants this feature
        }
        // If false or undefined, fall through to plan-based check below
    }

    // 2. Plan-based logic (always runs if server flag didn't grant)
    const plan = getEffectivePlan(currentPlan, subscriptionOrCreatedAt);

    const permissions = {
        // Shared Premium & Business Features
        'FINANCIAL_DASHBOARD': [PLANS.PREMIUM, PLANS.BUSINESS],
        'AI_INSIGHTS': [PLANS.PREMIUM, PLANS.BUSINESS],
        'CUSTOMER_MANAGER': [PLANS.PREMIUM, PLANS.BUSINESS],
        'DEBTORS_TRACKER': [PLANS.PREMIUM, PLANS.BUSINESS],
        'SALES_RECEIPTS': [PLANS.PREMIUM, PLANS.BUSINESS, PLANS.FREE],

        // Business Plan ONLY Features
        'WAREHOUSE': [PLANS.BUSINESS],
        'ADMIN_OPS': [PLANS.BUSINESS],
        'STOCK_TRANSFER': [PLANS.BUSINESS],
        'MULTI_STORE': [PLANS.BUSINESS],
        'ADVANCED_TEAM': [PLANS.BUSINESS],
    };

    const allowedPlans = permissions[featureName] || [];
    return allowedPlans.includes(plan);
};

/**
 * Gets trial days remaining from subscription record
 * @param {object|string} subscriptionOrCreatedAt - Subscription object or legacy createdAt string
 * @returns {number} Days remaining (0 if no trial active)
 */
export const getTrialDaysRemaining = (subscriptionOrCreatedAt) => {
    if (!subscriptionOrCreatedAt) return 0;

    // DB-level: use trial_end from the subscription record
    if (typeof subscriptionOrCreatedAt === 'object' && subscriptionOrCreatedAt.trial_end) {
        const trialEnd = new Date(subscriptionOrCreatedAt.trial_end);
        const today = new Date();
        const remaining = Math.ceil((trialEnd - today) / (1000 * 60 * 60 * 24));
        return remaining > 0 ? remaining : 0;
    }

    // Legacy fallback: calculate from created_at string
    if (typeof subscriptionOrCreatedAt === 'string') {
        const registrationDate = new Date(subscriptionOrCreatedAt);
        const today = new Date();
        const diffDays = Math.floor((today - registrationDate) / (1000 * 60 * 60 * 24));
        const remaining = 21 - diffDays;
        return remaining > 0 ? remaining : 0;
    }

    return 0;
};

/**
 * setupRBAC: Unified access check for both Store Plan and User Permissions
 * @param {string} feature - Feature name (e.g., 'WAREHOUSE')
 * @param {string} plan - Parent store's current plan
 * @param {object|string} subscriptionOrCreatedAt - Subscription object or legacy created_at
 * @param {string[]} userAllowedFeatures - Features specifically assigned to this user
 * @returns {boolean}
 */
export const setupRBAC = (feature, plan, subscriptionOrCreatedAt, userAllowedFeatures = null) => {
    // 1. Check if the Store Plan allows this feature
    const planAllows = hasFeature(feature, plan, subscriptionOrCreatedAt);
    if (!planAllows) return false;

    // 2. If granular user permissions are provided, check them
    if (userAllowedFeatures) {
        const normalizedUserFeatures = userAllowedFeatures.map(f => f.toLowerCase());
        const normalizedFeature = feature.toLowerCase();
        return normalizedUserFeatures.includes(normalizedFeature);
    }

    return true;
};
