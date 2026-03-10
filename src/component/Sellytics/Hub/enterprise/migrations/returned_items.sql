create table public.returned_items (
  id serial not null,
  store_id integer not null,
  product_id integer null,
  customer_id integer null,
  sales_id integer null,
  remark text null,
  returned_date timestamp with time zone not null default CURRENT_TIMESTAMP,
  created_by_user integer null,
  created_by_owner integer null,
  status text null,
  quantity integer null,
  constraint returned_items_pkey primary key (id),
  constraint returned_items_created_by_owner_fkey foreign KEY (created_by_owner) references stores (id) on delete set null,
  constraint returned_items_created_by_user_fkey foreign KEY (created_by_user) references store_users (id) on delete set null,
  constraint returned_items_customer_id_fkey foreign KEY (customer_id) references customer (id) on delete set null,
  constraint returned_items_product_id_fkey foreign KEY (product_id) references dynamic_product (id) on delete set null,
  constraint returned_items_sales_id_fkey foreign KEY (sales_id) references dynamic_sales (id) on delete set null,
  constraint returned_items_store_id_fkey foreign KEY (store_id) references stores (id) on delete CASCADE,
  constraint chk_returned_creator check (
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