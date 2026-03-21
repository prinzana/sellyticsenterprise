create table public.subscriptions (
  id uuid not null default gen_random_uuid (),
  store_id integer null,
  plan_name text not null,
  status text not null default 'pending'::text,
  paystack_subscription_code text null,
  paystack_customer_code text null,
  amount numeric(10, 2) null,
  next_payment_date timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  last_synced_at timestamp with time zone null default now(),
  trial_start timestamp with time zone null,
  trial_end timestamp with time zone null,
  is_trial boolean null default false,
  constraint subscriptions_pkey primary key (id),
  constraint subscriptions_paystack_subscription_code_key unique (paystack_subscription_code),
  constraint subscriptions_store_id_fkey foreign KEY (store_id) references stores (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_store_status on public.subscriptions using btree (store_id, status) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_trial_end on public.subscriptions using btree (trial_end) TABLESPACE pg_default
where
  (is_trial = true);

create trigger trg_sync_store_plan
after INSERT
or
update on subscriptions for EACH row
execute FUNCTION sync_store_plan_from_subscription ();