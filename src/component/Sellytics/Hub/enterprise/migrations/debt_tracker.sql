create table public.debt_tracker (
  id serial not null,
  store_id integer not null,
  dynamic_product_id integer null,
  customer_id integer null,
  customer_name character varying(255) null,
  phone_number character varying(50) null,
  amount_owed numeric(12, 2) not null,
  amount_deposited numeric(12, 2) not null default 0,
  amount_remaining numeric GENERATED ALWAYS as ((amount_owed - amount_deposited)) STORED (12, 2) null,
  debt_date timestamp with time zone not null default CURRENT_TIMESTAMP,
  created_by_user integer null,
  created_by_owner integer null,
  created_by text null,
  constraint debt_tracker_pkey primary key (id),
  constraint debt_tracker_store_id_fkey foreign KEY (store_id) references stores (id) on delete CASCADE,
  constraint debt_tracker_created_by_user_fkey foreign KEY (created_by_user) references store_users (id) on delete set null,
  constraint debt_tracker_customer_id_fkey foreign KEY (customer_id) references customer (id) on delete set null,
  constraint debt_tracker_dynamic_product_id_fkey foreign KEY (dynamic_product_id) references dynamic_product (id),
  constraint debt_tracker_created_by_owner_fkey foreign KEY (created_by_owner) references stores (id) on delete set null,
  constraint debt_tracker_amount_owed_check check ((amount_owed >= (0)::numeric)),
  constraint debt_tracker_amount_deposited_check check ((amount_deposited >= (0)::numeric)),
  constraint chk_debt_creator check (
    (
      (
        (created_by_user is not null)
        and (created_by_owner is null)
      )
      or (
        (created_by_owner is not null)
        and (created_by_user is null)
      )
    )
  )
) TABLESPACE pg_default;