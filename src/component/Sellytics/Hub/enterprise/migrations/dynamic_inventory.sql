create table public.dynamic_inventory (
  id serial not null,
  dynamic_product_id integer not null,
  store_id integer not null,
  quantity integer not null default 0,
  available_qty integer not null default 0,
  quantity_sold integer not null default 0,
  reorder_level integer not null default 0,
  last_updated timestamp with time zone null,
  updated_at timestamp with time zone null,
  safety_stock integer null default 0,
  store_owner_id integer null,
  min_level integer null default 0,
  max_level integer null default 0,
  auto_restock_enabled boolean null default false,
  last_restocked_at timestamp with time zone null,
  constraint dynamic_inventory_pkey primary key (id),
  constraint unique_product_store unique (dynamic_product_id, store_id),
  constraint dynamic_inventory_dynamic_product_id_fkey foreign KEY (dynamic_product_id) references dynamic_product (id) on delete CASCADE,
  constraint dynamic_inventory_store_id_fkey foreign KEY (store_id) references stores (id) on delete CASCADE,
  constraint dynamic_inventory_store_owner_id_fkey foreign KEY (store_owner_id) references store_owners (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger audit_dynamic_inventory
after INSERT
or DELETE
or
update on dynamic_inventory for EACH row
execute FUNCTION log_audit ();

create trigger dynamic_inventory_update_trigger BEFORE
update on dynamic_inventory for EACH row
execute FUNCTION update_dynamic_inventory ();