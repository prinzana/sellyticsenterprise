

create table public.debts (
  id serial not null,
  store_id integer not null,
  customer_id integer not null,
  dynamic_product_id integer not null,
  customer_name character varying(255) not null,
  product_name character varying(255) not null,
  phone_number character varying(100) null,
  supplier character varying(255) null,
  device_id character varying(100) null,
  qty integer not null,
  owed numeric(10, 2) not null,
  deposited numeric(10, 2) not null default 0.00,
  date date not null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  remaining_balance numeric null,
  paid_to text null,
  created_by_user_id integer null,
  owner_id integer null,
  performed_by text null,
  device_sizes text null,
  is_paid boolean null default false,
  is_returned boolean null default false,
  remark text null,
  created_by_email text null,
  updated_at timestamp with time zone null,
  payments jsonb null,
  constraint debts_pkey primary key (id),
  constraint debts_created_by_user_id_fkey foreign KEY (created_by_user_id) references store_users (id) on delete CASCADE,
  constraint debts_customer_id_fkey foreign KEY (customer_id) references customer (id) on delete CASCADE,
  constraint debts_dynamic_product_id_fkey foreign KEY (dynamic_product_id) references dynamic_product (id) on delete CASCADE,
  constraint debts_owner_id_fkey foreign KEY (owner_id) references store_users (id) on delete CASCADE,
  constraint debts_store_id_fkey foreign KEY (store_id) references stores (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger after_insert_debts_notify
after INSERT on debts for EACH row
execute FUNCTION notify_debt_operation ();

create trigger after_update_debts_notify
after
update on debts for EACH row
execute FUNCTION notify_debt_operation ();

create trigger audit_debts
after INSERT
or DELETE
or
update on debts for EACH row
execute FUNCTION log_audit ();

create trigger before_compute_remaining_balance BEFORE INSERT
or
update OF owed,
deposited on debts for EACH row
execute FUNCTION compute_remaining_balance ();

create trigger trigger_debt_to_sale
after
update OF deposited on debts for EACH row when (
  new.deposited >= new.owed
  and (
    old.deposited is null
    or old.deposited < old.owed
  )
)
execute FUNCTION create_sale_from_paid_debt ();