-- ============================================
-- SELLYTICS: Auto Free Trial Subscription
-- ============================================
-- This migration adds trial tracking columns to subscriptions
-- and creates a trigger to auto-insert a free trial when a store is created.
--
-- KEY RULE: Only the PARENT store (first store for an owner) gets a subscription.
-- Child stores created from the parent's dashboard inherit the parent's plan.
-- ============================================

-- 1. Add trial-specific columns to subscriptions table
ALTER TABLE public.subscriptions 
  ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false;

-- 2. Create the trigger function
CREATE OR REPLACE FUNCTION public.create_free_trial_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- SKIP if this store already has an owner_user_id set AND
  -- there is already a subscription for another store under the same owner.
  -- This means it's a CHILD store created from the parent's dashboard.
  IF NEW.owner_user_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.subscriptions sub
      JOIN public.stores s ON s.id = sub.store_id
      WHERE s.owner_user_id = NEW.owner_user_id
    ) THEN
      -- Child store — parent already has a subscription, skip
      RETURN NEW;
    END IF;
  END IF;

  -- PARENT store (first registration) — create the trial subscription
  INSERT INTO public.subscriptions (
    store_id,
    plan_name,
    status,
    is_trial,
    trial_start,
    trial_end,
    amount,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'BUSINESS',                        -- Full access during trial
    'trialing',                        -- Distinct from 'active' (paid)
    true,
    NOW(),                             -- Trial starts now
    NOW() + INTERVAL '21 days',        -- Trial ends in 21 days
    0.00,                              -- Free
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger (fires AFTER insert so NEW.id is available)
DROP TRIGGER IF EXISTS trg_create_free_trial ON public.stores;
CREATE TRIGGER trg_create_free_trial
AFTER INSERT ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.create_free_trial_subscription();

-- 4. Backfill: Create trial records for PARENT stores that don't have one
-- Only for the FIRST store per owner
INSERT INTO public.subscriptions (store_id, plan_name, status, is_trial, trial_start, trial_end, amount, created_at, updated_at)
SELECT 
  first_store.id,
  'BUSINESS',
  CASE 
    WHEN first_store.created_at + INTERVAL '21 days' > NOW() THEN 'trialing'
    ELSE 'expired'
  END,
  true,
  first_store.created_at,
  first_store.created_at + INTERVAL '21 days',
  0.00,
  first_store.created_at,
  NOW()
FROM (
  SELECT DISTINCT ON (owner_user_id) id, owner_user_id, created_at
  FROM public.stores
  WHERE owner_user_id IS NOT NULL
  ORDER BY owner_user_id, created_at ASC
) first_store
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions sub WHERE sub.store_id = first_store.id
);

-- 5. CLEANUP: Remove orphan subscriptions for child stores
-- Child stores should NOT have their own subscription
DELETE FROM public.subscriptions sub
WHERE EXISTS (
  SELECT 1 FROM public.stores child
  WHERE child.id = sub.store_id
  AND child.owner_user_id IS NOT NULL
  AND child.id != (
    SELECT s2.id FROM public.stores s2
    WHERE s2.owner_user_id = child.owner_user_id
    ORDER BY s2.created_at ASC
    LIMIT 1
  )
);

-- 6. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_store_status ON public.subscriptions(store_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON public.subscriptions(trial_end) WHERE is_trial = true;
