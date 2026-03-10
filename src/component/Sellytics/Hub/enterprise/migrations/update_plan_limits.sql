-- Migration: Add Plan Limits to Subscription Plans
-- This allows super admins to manage limits dynamically from the dashboard.

-- 1. Ensure subscription_plans table exists and has limit columns
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    max_users_per_store INTEGER DEFAULT 1,
    max_stores INTEGER DEFAULT 1,
    max_products INTEGER DEFAULT 50, -- -1 for Infinity
    has_warehouse BOOLEAN NOT NULL DEFAULT FALSE,
    has_admin_ops BOOLEAN NOT NULL DEFAULT FALSE,
    has_ai_insights BOOLEAN NOT NULL DEFAULT FALSE,
    has_financial_dashboard BOOLEAN NOT NULL DEFAULT FALSE,
    has_multi_store BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add columns if table already exists but columns don't
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS max_users_per_store INTEGER DEFAULT 1;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS max_stores INTEGER DEFAULT 1;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS max_products INTEGER DEFAULT 50;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS has_warehouse BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS has_admin_ops BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS has_ai_insights BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS has_financial_dashboard BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS has_multi_store BOOLEAN DEFAULT FALSE;

-- 3. Seed default limits & features
-- FREE Plan
INSERT INTO public.subscription_plans (name, price, description, max_users_per_store, max_stores, max_products, has_warehouse, has_admin_ops, has_ai_insights, has_financial_dashboard, has_multi_store)
VALUES ('FREE', 0.00, 'Basic plan for small shops', 1, 1, 50, FALSE, FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (name) DO UPDATE SET 
    max_users_per_store = EXCLUDED.max_users_per_store,
    max_stores = EXCLUDED.max_stores,
    max_products = EXCLUDED.max_products,
    has_warehouse = EXCLUDED.has_warehouse,
    has_admin_ops = EXCLUDED.has_admin_ops,
    has_ai_insights = EXCLUDED.has_ai_insights,
    has_financial_dashboard = EXCLUDED.has_financial_dashboard,
    has_multi_store = EXCLUDED.has_multi_store;

-- PREMIUM Plan
INSERT INTO public.subscription_plans (name, price, description, max_users_per_store, max_stores, max_products, has_warehouse, has_admin_ops, has_ai_insights, has_financial_dashboard, has_multi_store)
VALUES ('PREMIUM', 5000.00, 'Advanced features for growing businesses', 5, 1, -1, FALSE, FALSE, TRUE, TRUE, FALSE)
ON CONFLICT (name) DO UPDATE SET 
    max_users_per_store = EXCLUDED.max_users_per_store,
    max_stores = EXCLUDED.max_stores,
    max_products = EXCLUDED.max_products,
    has_warehouse = EXCLUDED.has_warehouse,
    has_admin_ops = EXCLUDED.has_admin_ops,
    has_ai_insights = EXCLUDED.has_ai_insights,
    has_financial_dashboard = EXCLUDED.has_financial_dashboard,
    has_multi_store = EXCLUDED.has_multi_store;

-- BUSINESS Plan
INSERT INTO public.subscription_plans (name, price, description, max_users_per_store, max_stores, max_products, has_warehouse, has_admin_ops, has_ai_insights, has_financial_dashboard, has_multi_store)
VALUES ('BUSINESS', 15000.00, 'Enterprise-grade tools for multi-store management', 10, 3, -1, TRUE, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (name) DO UPDATE SET 
    max_users_per_store = EXCLUDED.max_users_per_store,
    max_stores = EXCLUDED.max_stores,
    max_products = EXCLUDED.max_products,
    has_warehouse = EXCLUDED.has_warehouse,
    has_admin_ops = EXCLUDED.has_admin_ops,
    has_ai_insights = EXCLUDED.has_ai_insights,
    has_financial_dashboard = EXCLUDED.has_financial_dashboard,
    has_multi_store = EXCLUDED.has_multi_store;

-- 4. Update get_owner_subscription RPC
DROP FUNCTION IF EXISTS public.get_owner_subscription(INTEGER);

CREATE OR REPLACE FUNCTION public.get_owner_subscription(p_owner_id INTEGER)
RETURNS TABLE (
    id UUID,
    store_id INTEGER,
    plan_name TEXT,
    status TEXT,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    is_trial BOOLEAN,
    max_users_per_store INTEGER,
    max_stores INTEGER,
    max_products INTEGER,
    has_warehouse BOOLEAN,
    has_admin_ops BOOLEAN,
    has_ai_insights BOOLEAN,
    has_financial_dashboard BOOLEAN,
    has_multi_store BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sub.id,
        sub.store_id,
        sub.plan_name,
        sub.status,
        sub.trial_start,
        sub.trial_end,
        sub.is_trial,
        COALESCE(p.max_users_per_store, 1) as max_users_per_store,
        COALESCE(p.max_stores, 1) as max_stores,
        COALESCE(p.max_products, 50) as max_products,
        COALESCE(p.has_warehouse, FALSE) as has_warehouse,
        COALESCE(p.has_admin_ops, FALSE) as has_admin_ops,
        COALESCE(p.has_ai_insights, FALSE) as has_ai_insights,
        COALESCE(p.has_financial_dashboard, FALSE) as has_financial_dashboard,
        COALESCE(p.has_multi_store, FALSE) as has_multi_store
    FROM public.subscriptions sub
    LEFT JOIN public.subscription_plans p ON LOWER(p.name) = LOWER(sub.plan_name)
    WHERE sub.store_id IN (
        SELECT s.id FROM public.stores s WHERE s.owner_user_id = p_owner_id
    )
    ORDER BY sub.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
