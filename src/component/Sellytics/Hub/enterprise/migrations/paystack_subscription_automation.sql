-- Migration: Paystack Subscription Automation
-- This script ensures the stores table aligns with the subscriptions table.
-- When a Paystack webhook updates the subscriptions table, the stores table 
-- is automatically updated via database triggers.

-- 1. Ensure the 'plan' column exists in stores
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'FREE';

-- 2. Create/Update a robust subscriptions table
-- Note: Paystack webhooks typically send 'subscription_code' and 'status'
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id INTEGER REFERENCES public.stores(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,                -- 'FREE', 'PREMIUM', 'BUSINESS'
  status TEXT NOT NULL DEFAULT 'pending', -- 'active', 'past_due', 'canceled', 'expired'
  paystack_subscription_code TEXT UNIQUE,
  paystack_customer_code TEXT,
  amount NUMERIC(10, 2),
  next_payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create the automation function
CREATE OR REPLACE FUNCTION public.sync_store_plan_from_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- CASE A: Upgrade - Subscription is now active
  IF NEW.status = 'active' THEN
    UPDATE public.stores
    SET 
      plan = NEW.plan_name,
      premium = CASE WHEN NEW.plan_name = 'FREE' THEN false ELSE true END,
      updated_at = NOW()
    WHERE id = NEW.store_id;

  -- CASE B: Downgrade - Subscription was active but now it's not
  ELSIF (OLD.status = 'active' AND NEW.status != 'active') THEN
    UPDATE public.stores
    SET 
      plan = 'FREE',
      premium = false,
      updated_at = NOW()
    WHERE id = NEW.store_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create the Trigger
DROP TRIGGER IF EXISTS trg_sync_store_plan ON public.subscriptions;
CREATE TRIGGER trg_sync_store_plan
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION sync_store_plan_from_subscription();

-- 5. Helper Function for Webhooks (Optional but recommended)
-- This allows your backend to just UPSERT into the subscriptions table
-- by paystack_subscription_code without needing to know the store_id mapping every time
-- (if you store the code during the initial checkout)
COMMENT ON TABLE public.subscriptions IS 'Managed by Paystack Webhooks. Automatically updates the stores table plans.';

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can only see subscriptions for their own store(s)
-- (Assumes you have store_id in the authenticated user's context or logic)
CREATE POLICY "Users can view their own store subscriptions" 
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  store_id IN (
    SELECT id FROM public.stores 
    WHERE owner_user_id::text = auth.uid()::text
  )
);

-- Policy: Allow service role (Webhooks/Backend) to do everything
-- This is critical for Paystack webhooks to update the table
CREATE POLICY "Service role can manage all subscriptions" 
ON public.subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 7. Add Audit Column for Sync Tracking
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ DEFAULT NOW();
