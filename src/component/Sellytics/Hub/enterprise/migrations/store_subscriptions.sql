create table public.store_subscriptions (
  id serial not null,
  store_id integer not null,
  subscription_plan_id integer not null,
  subscribed_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint store_subscriptions_pkey primary key (id),
  constraint store_subscriptions_store_id_fkey foreign KEY (store_id) references stores (id) on delete CASCADE,
  constraint store_subscriptions_subscription_plan_id_fkey foreign KEY (subscription_plan_id) references subscription_plans (id) on delete CASCADE
) TABLESPACE pg_default;