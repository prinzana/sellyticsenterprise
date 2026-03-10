create table public.stores (
  id serial not null,
  shop_name character varying(255) not null,
  full_name character varying(255) not null,
  email_address text not null,
  nature_of_business character varying(255) null,
  password character varying(255) not null,
  phone_number text null,
  physical_address text null,
  state text null,
  business_logo character varying(255) null,
  default_currency character varying(10) null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  reset_token character varying(255) null,
  token_expiry timestamp without time zone null,
  is_active boolean null default true,
  business_address text not null,
  owner_user_id integer null,
  allowed_dashboard text null,
  allowed_features text null,
  notification_enabled boolean null default true,
  premium boolean null default false,
  plan text null default 'FREE',
  constraint stores_pkey primary key (id),
  constraint stores_email_key unique (email_address),
  constraint stores_owner_user_id_fkey foreign KEY (owner_user_id) references store_owners (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create trigger on_new_store_trigger
after INSERT on stores for EACH row
execute FUNCTION notify_on_new_store ();

create trigger store_owner_insert_trigger
after INSERT on stores for EACH row
execute FUNCTION insert_into_store_owners ();

create trigger trg_update_timestamp BEFORE
update on stores for EACH row
execute FUNCTION update_updated_at_column ();

create trigger trigger_create_default_warehouse
after INSERT on stores for EACH row
execute FUNCTION create_default_warehouse_for_store ();

create trigger trigger_on_new_store
after INSERT on stores for EACH row
execute FUNCTION notify_on_new_store ();

create trigger trigger_set_default_features BEFORE INSERT on stores for EACH row
execute FUNCTION set_default_allowed_features ();