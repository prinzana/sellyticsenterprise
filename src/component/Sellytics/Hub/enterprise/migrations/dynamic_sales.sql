create table public.dynamic_sales (
  id serial not null,
  dynamic_product_id integer not null,
  store_id integer not null,
  quantity integer not null,
  unit_price numeric(10, 2) not null,
  amount numeric(10, 2) not null,
  payment_method text not null,
  sold_at timestamp with time zone not null default now(),
  device_id character varying null,
  sale_group_id integer null,
  paid_to text null,
  created_by_user_id integer null,
  dynamic_product_imeis text null,
  device_size text null,
  status text null default 'sold'::text,
  customer_id integer null,
  customer_name text null,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  created_by_owner_id integer null,
  created_by_owner integer null,
  owner_id integer null,
  "syncError" text null,
  created_by_stores integer null,
  created_by_email text null,
  notes text null,
  constraint dynamic_sales_pkey primary key (id),
  constraint dynamic_sales_created_by_owner_id_fkey foreign KEY (created_by_owner_id) references store_owners (id),
  constraint dynamic_sales_created_by_stores_fkey foreign KEY (created_by_stores) references stores (id) on update CASCADE on delete CASCADE,
  constraint dynamic_sales_created_by_user_id_fkey foreign KEY (created_by_user_id) references store_users (id) on update CASCADE on delete CASCADE,
  constraint dynamic_sales_customer_id_fkey foreign KEY (customer_id) references customer (id) on delete set null,
  constraint dynamic_sales_dynamic_product_id_fkey foreign KEY (dynamic_product_id) references dynamic_product (id) on delete CASCADE,
  constraint dynamic_sales_sale_group_id_fkey foreign KEY (sale_group_id) references sale_groups (id) on update CASCADE on delete CASCADE,
  constraint dynamic_sales_created_by_owner_fkey foreign KEY (created_by_owner) references stores (id) on update CASCADE on delete CASCADE,
  constraint dynamic_sales_store_id_fkey foreign KEY (store_id) references stores (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger after_insert_dynamic_sales_notify
after INSERT on dynamic_sales for EACH row
execute FUNCTION notify_sale ();

create trigger audit_dynamic_sales
after INSERT
or DELETE
or
update on dynamic_sales for EACH row
execute FUNCTION log_audit ();

create trigger on_sale_created
after INSERT on dynamic_sales for EACH row
execute FUNCTION handle_new_sale ();

create trigger on_sale_deleted
after DELETE on dynamic_sales for EACH row
execute FUNCTION handle_sale_deletion ();

create trigger queue_sale_notification
after INSERT on dynamic_sales for EACH row
execute FUNCTION queue_push_notification ();

create trigger suppliers_inventory_sales_trigger
after INSERT on dynamic_sales for EACH row
execute FUNCTION sync_suppliers_inventory_from_sales ();

create trigger trg_dynamic_sales_audit
after INSERT
or DELETE
or
update on dynamic_sales for EACH row
execute FUNCTION log_dynamic_sales_activity ();

create trigger trg_update_dynamic_sales_timestamp BEFORE
update on dynamic_sales for EACH row
execute FUNCTION update_dynamic_sales_updated_at ();

create trigger update_dynamic_sales_inventory BEFORE INSERT
or
update OF quantity on dynamic_sales for EACH row
execute FUNCTION trg_reduce_dynamic_inventory ();