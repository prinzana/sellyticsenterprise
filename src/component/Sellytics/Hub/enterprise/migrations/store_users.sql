create table public.store_users (
  id serial not null,
  store_id integer not null,
  full_name character varying(255) not null,
  email_address text not null,
  phone_number character varying(50) null,
  role character varying(50) not null,
  password character varying(255) not null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  allowed_features text[] null,
  notification_email text null,
  qr_code text null,
  allowed_dashboard text null,
  users_dashboard text null,
  owner_id integer null,
  constraint store_users_pkey primary key (id),
  constraint store_users_email_address_key unique (email_address),
  constraint store_users_qr_code_key unique (qr_code),
  constraint store_users_owner_id_fkey foreign KEY (owner_id) references store_owners (id),
  constraint store_users_store_id_fkey foreign KEY (store_id) references stores (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger trg_update_store_user_timestamp BEFORE
update on store_users for EACH row
execute FUNCTION update_store_user_updated_at ();