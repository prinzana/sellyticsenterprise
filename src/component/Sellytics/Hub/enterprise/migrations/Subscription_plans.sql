create table public.subscription_plans (
  id serial not null,
  name text not null,
  price integer not null,
  description text null,
  max_users_per_store integer null default 1,
  max_stores integer null default 1,
  max_products integer null default 50,
  has_warehouse boolean null default false,
  has_admin_ops boolean null default false,
  has_ai_insights boolean null default false,
  has_financial_dashboard boolean null default false,
  has_multi_store boolean null default false,
  constraint subscription_plans_pkey primary key (id),
  constraint subscription_plans_name_key unique (name)
) TABLESPACE pg_default;